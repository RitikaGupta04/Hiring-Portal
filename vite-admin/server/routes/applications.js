// server/routes/applications.js
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import documentService from '../services/documentService.js';
import scoringService from '../services/scoringService.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure multer
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'));
    }
  }
});

// Helper: Upload to Supabase Storage
const uploadToStorage = async (bucket, fileName, fileBuffer) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType: 'application/octet-stream',
      upsert: false
    });
  if (error) throw error;
  return data.path;
};

const router = express.Router();

// Get top ranked applications
router.get('/rankings/top', async (req, res) => {
  try {
    const { department = null, position = null, limit = '10' } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 10, 50);

    const top = await scoringService.getTopRankedApplications(
      department && department !== 'All' ? department : null,
      position && position !== 'All' ? position : null,
      parsedLimit
    );

    // Enrich with NIRF/QS scores (0..10) for UI switching
    // Enrich with async fallbacks (research/teaching institutions) when university is missing or unmatched
    // Also fetch teaching post from teaching_experiences table
    let enriched = await Promise.all((top || []).map(async (app) => {
      let uniLower = (app.university || '').toLowerCase();
      let { nirf10, qs10 } = scoringService.getUniversityRankingScores(uniLower);
      
      // Fetch teaching post (Professor, Associate Professor, etc.) from teaching_experiences
      let teachingPost = null;
      if (app.id) {
        const { data: teachingData } = await supabase
          .from('teaching_experiences')
          .select('post')
          .eq('application_id', app.id)
          .order('start_date', { ascending: false })
          .limit(1);
        teachingPost = teachingData && teachingData[0]?.post;
      }

      // Fallback to research institution
      if ((nirf10 == null && qs10 == null) && app.id) {
        const { data: rData } = await supabase
          .from('research_experiences')
          .select('institution')
          .eq('application_id', app.id)
          .limit(1);
        const rInst = rData && rData[0]?.institution;
        if (rInst) {
          const scores = scoringService.getUniversityRankingScores((rInst || '').toLowerCase());
          nirf10 = scores.nirf10; qs10 = scores.qs10;
        }
      }

      // Fallback to teaching institution
      if ((nirf10 == null && qs10 == null) && app.id) {
        const { data: tData } = await supabase
          .from('teaching_experiences')
          .select('institution')
          .eq('application_id', app.id)
          .limit(1);
        const tInst = tData && tData[0]?.institution;
        if (tInst) {
          const scores = scoringService.getUniversityRankingScores((tInst || '').toLowerCase());
          nirf10 = scores.nirf10; qs10 = scores.qs10;
        }
      }

      return { ...app, nirf10, qs10, teachingPost };
    }));

    // Attach research metrics: papers, h-index, and score
    try {
      const appIds = enriched.map(a => a.id).filter(Boolean);
      if (appIds.length) {
        const { data: researchData, error: resErr } = await supabase
          .from('research_info')
          .select('application_id, scopus_general_papers, conference_papers, scopus_id, orchid_id')
          .in('application_id', appIds);
        
        if (!resErr && Array.isArray(researchData)) {
          const map = new Map(researchData.map(r => [
            r.application_id, 
            {
              total_papers: (r.scopus_general_papers || 0) + (r.conference_papers || 0),
              scopus_papers: r.scopus_general_papers || 0,
              conference_papers: r.conference_papers || 0,
              scopus_id: r.scopus_id,
              orchid_id: r.orchid_id
            }
          ]));
          
          // Calculate research score and metrics
          enriched = enriched.map(a => {
            const research = map.get(a.id);
            let researchScore10 = null;
            let totalPapers = 0;
            
            if (research) {
              totalPapers = research.total_papers;
              
              // Score based on total Scopus papers: normalize to 0-10 scale
              // 50+ papers = 10, linear scaling below that
              const paperScore = Math.min((totalPapers / 50) * 10, 10);
              
              researchScore10 = Math.min(Math.round(paperScore * 10) / 10, 10);
            }
            
            return { 
              ...a, 
              researchScore10,
              totalPapers
            };
          });
        }
      }
    } catch (e) {
      console.warn('Research score enrichment warning:', e.message);
    }

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching top rankings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch top rankings' });
  }
});

router.post(
  '/',
  upload.fields([
    { name: 'coverLetterPath', maxCount: 1 },
    { name: 'teachingStatement', maxCount: 1 },
    { name: 'researchStatement', maxCount: 1 },
    { name: 'cvPath', maxCount: 1 },
    { name: 'otherPublications', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Extract raw fields
      let {
        position,
        department,
        branch,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        address,
        highest_degree,
        university,
        graduation_year,
        previous_positions,
        years_of_experience,
        gender,
        date_of_birth,
        nationality,
        teachingExperiences,
        researchExperiences,
        researchInfo,
        user_id
      } = req.body;

      // Handle JSON parsing for multipart/form-data submissions
      try {
        if (typeof teachingExperiences === 'string') {
          teachingExperiences = JSON.parse(teachingExperiences);
        }
      } catch (e) {
        console.warn('Failed to parse teachingExperiences JSON:', e.message);
        teachingExperiences = [];
      }
      try {
        if (typeof researchExperiences === 'string') {
          researchExperiences = JSON.parse(researchExperiences);
        }
      } catch (e) {
        console.warn('Failed to parse researchExperiences JSON:', e.message);
        researchExperiences = [];
      }
      try {
        if (typeof researchInfo === 'string') {
          researchInfo = JSON.parse(researchInfo);
        }
      } catch (e) {
        console.warn('Failed to parse researchInfo JSON:', e.message);
        researchInfo = {};
      }

      // Defaults if undefined
      teachingExperiences = teachingExperiences || [];
      researchExperiences = researchExperiences || [];
      researchInfo = researchInfo || {};

      // ✅ Authentication check moved inside route
      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!first_name || !email || !position || !department) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Idempotency/Duplicate guard: prevent multiple submissions for same user & role
      try {
        const { data: existing, error: existErr } = await supabase
          .from('faculty_applications')
          .select('id, created_at')
          .eq('user_id', user_id)
          .eq('position', position)
          .eq('department', department)
          .eq('branch', branch || '')
          .limit(1);
        if (!existErr && Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({
            error: 'You have already submitted an application for this position. Please wait or contact support if you believe this is a mistake.'
          });
        }
      } catch (dupCheckErr) {
        console.warn('Duplicate check warning:', dupCheckErr.message);
      }

      // Insert main application
      const { data: appData, error: appError } = await supabase
        .from('faculty_applications')
        .insert([{
          position,
          department,
          branch,
          first_name,
          middle_name,
          last_name,
          email,
          phone,
          address,
          highest_degree,
          university,
          graduation_year,
          previous_positions,
          years_of_experience,
          gender,
          date_of_birth,
          nationality,
          user_id
        }])
        .select()
        .single();

      if (appError) throw appError;

      const applicationId = appData.id;
      const docPaths = {};

      const uploadFile = async (fileKey, bucket, fieldName) => {
        if (req.files?.[fileKey]?.[0]) {
          const file = req.files[fileKey][0];
          const fileName = `${fieldName}_${applicationId}_${Date.now()}${path.extname(file.originalname)}`;
          const filePath = await uploadToStorage(bucket, fileName, file.buffer);
          docPaths[fieldName + '_path'] = filePath;
        }
      };

      await uploadFile('coverLetterPath', 'application-reports', 'cover_letter');
      await uploadFile('teachingStatement', 'application-reports', 'teaching_statement');
      await uploadFile('researchStatement', 'application-reports', 'research_statement');
      await uploadFile('cvPath', 'application-reports', 'cv');
      await uploadFile('otherPublications', 'application-reports', 'other_publications');

      if (Object.keys(docPaths).length > 0) {
        const { error: updateError } = await supabase
          .from('faculty_applications')
          .update(docPaths)
          .eq('id', applicationId);
        if (updateError) console.warn('Document path update failed:', updateError);
      }

      // Insert teaching experiences
      if (Array.isArray(teachingExperiences) && teachingExperiences.length > 0) {
        const teachingData = teachingExperiences.map(exp => ({
          application_id: applicationId,
          post: exp.teachingPost,
          institution: exp.teachingInstitution,
          start_date: exp.teachingStartDate,
          end_date: exp.teachingEndDate,
          experience: exp.teachingExperience
        }));
        const { error: teachError } = await supabase
          .from('teaching_experiences')
          .insert(teachingData);
        if (teachError) console.warn('Teaching insert failed:', teachError);
      }

      // Insert research experiences (optional)
      if (Array.isArray(researchExperiences) && researchExperiences.length > 0) {
        const validResearch = researchExperiences.filter(exp =>
          exp.researchPost || exp.researchInstitution || exp.researchStartDate || exp.researchEndDate
        );
        if (validResearch.length > 0) {
          const researchData = validResearch.map(exp => ({
            application_id: applicationId,
            post: exp.researchPost,
            institution: exp.researchInstitution,
            start_date: exp.researchStartDate,
            end_date: exp.researchEndDate,
            experience: exp.researchExperience
          }));
          const { error: resError } = await supabase
            .from('research_experiences')
            .insert(researchData);
          if (resError) console.warn('Research insert failed:', resError);
        }
      }

      // Insert research info
      if (researchInfo.scopus_id || researchInfo.google_scholar_id) {
        const { error: infoError } = await supabase
          .from('research_info')
          .insert({
            application_id: applicationId,
            scopus_id: researchInfo.scopus_id,
            orchid_id: researchInfo.orchid_id,
            google_scholar_id: researchInfo.google_scholar_id,
            scopus_general_papers: researchInfo.scopus_general_papers || 0,
            conference_papers: researchInfo.conference_papers || 0,
            edited_books: researchInfo.edited_books || 0
          });
        if (infoError) console.warn('Research info insert failed:', infoError);
      }

      // Trigger scoring and report asynchronously (don't block response)
      // Fire-and-forget: these operations can take 10-30 seconds with ML/AI services
      Promise.all([
        scoringService.submitApplication(applicationId),
        documentService.generateInitialReport(applicationId)
      ]).catch(err => {
        console.error('⚠️ Background scoring/report error for application', applicationId, ':', err.message);
        // Don't fail the submission - scoring/reports can be regenerated later
      });

      // Respond immediately to user
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! Your application is being processed.',
        applicationId
      });
    } catch (error) {
      console.error('Application submission error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
);

export default router;
