import express from 'express';
import scopusService from '../services/scopusService.js';

const router = express.Router();

/**
 * GET /api/scopus/author/:scopusId
 * Fetch author profile by Scopus ID
 */
router.get('/author/:scopusId', async (req, res) => {
  try {
    const { scopusId } = req.params;
    
    console.log(`📚 Fetching Scopus profile for ID: ${scopusId}`);
    
    const profile = await scopusService.getAuthorProfile(scopusId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error in /author/:scopusId:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scopus/documents/:scopusId
 * Fetch author's publications by Scopus ID
 */
router.get('/documents/:scopusId', async (req, res) => {
  try {
    const { scopusId } = req.params;
    const count = parseInt(req.query.count) || 25;
    
    console.log(`📄 Fetching Scopus documents for ID: ${scopusId}`);
    
    const documents = await scopusService.searchAuthorDocuments(scopusId, count);
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error in /documents/:scopusId:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scopus/complete/:scopusId
 * Fetch complete author data (profile + publications)
 */
router.get('/complete/:scopusId', async (req, res) => {
  try {
    const { scopusId } = req.params;
    
    console.log(`🔍 Fetching complete Scopus data for ID: ${scopusId}`);
    
    const data = await scopusService.getCompleteAuthorData(scopusId);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error in /complete/:scopusId:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scopus/validate
 * Validate Scopus ID and return basic info
 */
router.post('/validate', async (req, res) => {
  try {
    const { scopusId } = req.body;
    
    if (!scopusId || !/^\d{10,11}$/.test(scopusId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Scopus ID format. Expected 10-11 digit number.'
      });
    }
    
    console.log(`✅ Validating Scopus ID: ${scopusId}`);
    
    const profile = await scopusService.getAuthorProfile(scopusId);
    
    res.json({
      success: true,
      valid: true,
      data: {
        scopusId: profile.scopusId,
        authorName: profile.authorName,
        hIndex: profile.hIndex,
        documentCount: profile.documentCount
      }
    });
  } catch (error) {
    console.error('Error in /validate:', error.message);
    res.status(400).json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

export default router;
