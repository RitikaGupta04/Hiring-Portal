import supabase from '../config/db.js';

class MLService {
  constructor() {
    this.modelVersion = '1.0.0';
    this.modelName = 'faculty_recruitment_predictor';
  }

  // Main ML prediction function
  async predictApplicationSuccess(applicationId) {
    try {
      console.log(`🤖 Running ML prediction for application ${applicationId}`);

      // Get application data
      const application = await this.getApplicationData(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Extract features for ML model
      const features = this.extractFeatures(application);

      // Run ML prediction (simulated for now)
      const prediction = await this.runMLPrediction(features);

      // Save ML results to database
      await this.saveMLResults(applicationId, prediction, features);

      console.log(`✅ ML prediction completed for application ${applicationId}`);
      return prediction;

    } catch (error) {
      console.error('❌ Error in ML prediction:', error);
      throw error;
    }
  }

  // Get complete application data for ML analysis
  async getApplicationData(applicationId) {
    const { data: application, error: appError } = await supabase
      .from('faculty_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) throw appError;

    // Get related data
    const [teachingExp, researchExp, researchInfo, documents] = await Promise.all([
      supabase.from('teaching_experiences').select('*').eq('application_id', applicationId),
      supabase.from('research_experiences').select('*').eq('application_id', applicationId),
      supabase.from('research_info').select('*').eq('application_id', applicationId).single(),
      supabase.from('application_documents').select('*').eq('application_id', applicationId)
    ]);

    return {
      ...application,
      teachingExperiences: teachingExp.data || [],
      researchExperiences: researchExp.data || [],
      researchInfo: researchInfo.data || {},
      documents: documents.data || []
    };
  }

  // Extract features for ML model
  extractFeatures(application) {
    const features = {
      // Basic demographics
      age: this.calculateAge(application.date_of_birth),
      gender: application.gender,
      nationality: application.nationality,

      // Education features
      education_level: this.categorizeEducation(application.highest_degree),
      university_tier: this.categorizeUniversity(application.university),
      graduation_recency: this.calculateGraduationRecency(application.graduation_year),

      // Experience features
      total_experience_years: this.extractYearsFromExperience(application.years_of_experience),
      teaching_experience_count: application.teachingExperiences.length,
      research_experience_count: application.researchExperiences.length,
      has_industry_experience: this.hasIndustryExperience(application.previous_positions),

      // Research features
      total_publications: this.calculateTotalPublications(application.researchInfo),
      scopus_papers: application.researchInfo?.scopus_general_papers || 0,
      conference_papers: application.researchInfo?.conference_papers || 0,
      edited_books: application.researchInfo?.edited_books || 0,
      has_research_ids: this.hasResearchIds(application.researchInfo),

      // Position features
      position_type: application.position,
      department: application.department,
      branch: application.branch,

      // Application quality features
      document_completeness: this.calculateDocumentCompleteness(application),
      application_completeness: this.calculateApplicationCompleteness(application),
      description_quality: this.assessDescriptionQuality(application),

      // Derived features
      experience_to_publication_ratio: this.calculateExperienceToPublicationRatio(application),
      teaching_research_balance: this.calculateTeachingResearchBalance(application),
      career_progression: this.assessCareerProgression(application)
    };

    return features;
  }

  // Run ML prediction (simulated - replace with actual ML model)
  async runMLPrediction(features) {
    // This is a simulated ML model
    // In production, you would integrate with actual ML services like:
    // - TensorFlow.js
    // - Python ML models via API
    // - Cloud ML services (AWS SageMaker, Google AI Platform, etc.)

    let score = 0;
    let confidence = 0.8; // Base confidence

    // Education scoring (0-25 points)
    score += this.scoreEducation(features.education_level, features.university_tier);

    // Experience scoring (0-30 points)
    score += this.scoreExperience(features.total_experience_years, features.teaching_experience_count, features.research_experience_count);

    // Research scoring (0-25 points)
    score += this.scoreResearch(features.total_publications, features.scopus_papers, features.conference_papers);

    // Application quality scoring (0-20 points)
    score += this.scoreApplicationQuality(features.document_completeness, features.application_completeness, features.description_quality);

    // Normalize score to 0-100
    const normalizedScore = Math.min(Math.max(score, 0), 100);

    // Calculate confidence based on data completeness
    confidence = this.calculateConfidence(features);

    // Determine prediction category
    const category = this.categorizePrediction(normalizedScore);

    return {
      score: normalizedScore,
      confidence: confidence,
      category: category,
      features_used: Object.keys(features).length,
      model_metadata: {
        model_name: this.modelName,
        model_version: this.modelVersion,
        prediction_date: new Date().toISOString(),
        feature_importance: this.calculateFeatureImportance(features)
      }
    };
  }

  // Helper methods for feature extraction and scoring

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    return Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  }

  categorizeEducation(degree) {
    if (!degree) return 'unknown';
    const deg = degree.toLowerCase();
    if (deg.includes('phd') || deg.includes('doctorate')) return 'phd';
    if (deg.includes('master') || deg.includes('m.tech') || deg.includes('mba')) return 'masters';
    if (deg.includes('bachelor') || deg.includes('b.tech')) return 'bachelors';
    return 'other';
  }

  categorizeUniversity(university) {
    if (!university) return 'unknown';
    const uni = university.toLowerCase();
    const tier1 = ['iit', 'iim', 'iisc', 'du', 'jnu'];
    const tier2 = ['nit', 'iiser', 'tifr', 'isro'];
    
    if (tier1.some(t => uni.includes(t))) return 'tier1';
    if (tier2.some(t => uni.includes(t))) return 'tier2';
    if (uni.includes('university') || uni.includes('institute')) return 'tier3';
    return 'other';
  }

  calculateGraduationRecency(graduationYear) {
    if (!graduationYear) return null;
    const year = parseInt(graduationYear);
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  }

  extractYearsFromExperience(experienceStr) {
    if (!experienceStr) return 0;
    const yearsMatch = experienceStr.match(/(\d+)\s*years?/i);
    if (yearsMatch) {
      return parseInt(yearsMatch[1]);
    }
    const monthsMatch = experienceStr.match(/(\d+)\s*months?/i);
    if (monthsMatch) {
      return Math.floor(parseInt(monthsMatch[1]) / 12);
    }
    return 0;
  }

  hasIndustryExperience(previousPositions) {
    if (!previousPositions) return false;
    const positions = previousPositions.toLowerCase();
    const industryKeywords = ['industry', 'corporate', 'private', 'company', 'firm'];
    return industryKeywords.some(keyword => positions.includes(keyword));
  }

  calculateTotalPublications(researchInfo) {
    if (!researchInfo) return 0;
    return (researchInfo.scopus_general_papers || 0) + 
           (researchInfo.conference_papers || 0) + 
           (researchInfo.edited_books || 0);
  }

  hasResearchIds(researchInfo) {
    if (!researchInfo) return false;
    return !!(researchInfo.scopus_id || researchInfo.google_scholar_id || researchInfo.orchid_id);
  }

  calculateDocumentCompleteness(application) {
    const requiredDocs = ['resume_path', 'cover_letter_path'];
    const providedDocs = requiredDocs.filter(doc => application[doc]);
    return providedDocs.length / requiredDocs.length;
  }

  calculateApplicationCompleteness(application) {
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'highest_degree', 'university'];
    const providedFields = requiredFields.filter(field => application[field]);
    return providedFields.length / requiredFields.length;
  }

  assessDescriptionQuality(application) {
    let quality = 0;
    if (application.previous_positions && application.previous_positions.length > 50) quality += 0.5;
    if (application.teachingExperiences && application.teachingExperiences.length > 0) {
      const hasDetailedExp = application.teachingExperiences.some(exp => 
        exp.experience && exp.experience.length > 30
      );
      if (hasDetailedExp) quality += 0.5;
    }
    return quality;
  }

  calculateExperienceToPublicationRatio(application) {
    const experienceYears = this.extractYearsFromExperience(application.years_of_experience);
    const totalPublications = this.calculateTotalPublications(application.researchInfo);
    return experienceYears > 0 ? totalPublications / experienceYears : 0;
  }

  calculateTeachingResearchBalance(application) {
    const teachingCount = application.teachingExperiences.length;
    const researchCount = application.researchExperiences.length;
    const total = teachingCount + researchCount;
    return total > 0 ? Math.min(teachingCount, researchCount) / total : 0;
  }

  assessCareerProgression(application) {
    // Simple assessment based on position titles
    if (!application.previous_positions) return 0;
    const positions = application.previous_positions.toLowerCase();
    if (positions.includes('senior') || positions.includes('head') || positions.includes('director')) return 1;
    if (positions.includes('associate') || positions.includes('manager')) return 0.7;
    if (positions.includes('assistant') || positions.includes('junior')) return 0.4;
    return 0.2;
  }

  // Scoring methods

  scoreEducation(educationLevel, universityTier) {
    let score = 0;
    
    // Education level scoring
    switch (educationLevel) {
      case 'phd': score += 15; break;
      case 'masters': score += 10; break;
      case 'bachelors': score += 5; break;
      default: score += 2;
    }
    
    // University tier scoring
    switch (universityTier) {
      case 'tier1': score += 10; break;
      case 'tier2': score += 7; break;
      case 'tier3': score += 4; break;
      default: score += 1;
    }
    
    return Math.min(score, 25);
  }

  scoreExperience(totalYears, teachingCount, researchCount) {
    let score = 0;
    
    // Years of experience
    if (totalYears >= 10) score += 15;
    else if (totalYears >= 5) score += 12;
    else if (totalYears >= 2) score += 8;
    else score += 3;
    
    // Experience diversity
    const experienceDiversity = Math.min(teachingCount + researchCount, 5);
    score += experienceDiversity * 3;
    
    return Math.min(score, 30);
  }

  scoreResearch(totalPublications, scopusPapers, conferencePapers) {
    let score = 0;
    
    // Scopus papers (higher weight)
    if (scopusPapers >= 15) score += 15;
    else if (scopusPapers >= 10) score += 12;
    else if (scopusPapers >= 5) score += 8;
    else if (scopusPapers > 0) score += 4;
    
    // Conference papers
    if (conferencePapers >= 10) score += 7;
    else if (conferencePapers >= 5) score += 5;
    else if (conferencePapers > 0) score += 3;
    
    // Total publications bonus
    if (totalPublications >= 20) score += 3;
    else if (totalPublications >= 10) score += 2;
    else if (totalPublications >= 5) score += 1;
    
    return Math.min(score, 25);
  }

  scoreApplicationQuality(documentCompleteness, applicationCompleteness, descriptionQuality) {
    return (documentCompleteness * 8) + (applicationCompleteness * 7) + (descriptionQuality * 5);
  }

  calculateConfidence(features) {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence for missing data
    if (!features.age) confidence -= 0.1;
    if (!features.education_level || features.education_level === 'unknown') confidence -= 0.1;
    if (!features.university_tier || features.university_tier === 'unknown') confidence -= 0.1;
    if (features.total_experience_years === 0) confidence -= 0.1;
    if (features.total_publications === 0) confidence -= 0.1;
    
    return Math.max(confidence, 0.3); // Minimum confidence
  }

  categorizePrediction(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    if (score >= 40) return 'below_average';
    return 'poor';
  }

  calculateFeatureImportance(features) {
    // Simplified feature importance calculation
    return {
      education_level: 0.25,
      total_experience_years: 0.20,
      scopus_papers: 0.15,
      university_tier: 0.10,
      teaching_experience_count: 0.10,
      research_experience_count: 0.10,
      application_completeness: 0.05,
      document_completeness: 0.05
    };
  }

  // Save ML results to database
  async saveMLResults(applicationId, prediction, features) {
    try {
      const { error } = await supabase
        .from('ml_model_results')
        .insert({
          application_id: applicationId,
          model_name: this.modelName,
          model_version: this.modelVersion,
          prediction_score: prediction.score,
          confidence_level: prediction.confidence,
          features_used: features,
          model_metadata: prediction.model_metadata
        });

      if (error) throw error;

      console.log(`✅ ML results saved for application ${applicationId}`);
    } catch (error) {
      console.error('❌ Error saving ML results:', error);
      throw error;
    }
  }

  // Get ML predictions for an application
  async getMLPredictions(applicationId) {
    try {
      const { data, error } = await supabase
        .from('ml_model_results')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
      throw error;
    }
  }

  // Get ML model performance metrics
  async getModelPerformance() {
    try {
      const { data, error } = await supabase
        .from('ml_model_results')
        .select('prediction_score, confidence_level, created_at');

      if (error) throw error;

      // Calculate basic performance metrics
      const totalPredictions = data.length;
      const avgScore = data.reduce((sum, pred) => sum + pred.prediction_score, 0) / totalPredictions;
      const avgConfidence = data.reduce((sum, pred) => sum + pred.confidence_level, 0) / totalPredictions;

      return {
        total_predictions: totalPredictions,
        average_score: avgScore,
        average_confidence: avgConfidence,
        model_version: this.modelVersion,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating model performance:', error);
      throw error;
    }
  }

  // Batch prediction for multiple applications
  async batchPredict(applicationIds) {
    try {
      console.log(`🤖 Running batch ML prediction for ${applicationIds.length} applications`);
      
      const predictions = await Promise.all(
        applicationIds.map(id => this.predictApplicationSuccess(id))
      );

      console.log(`✅ Batch prediction completed for ${applicationIds.length} applications`);
      return predictions;
    } catch (error) {
      console.error('❌ Error in batch prediction:', error);
      throw error;
    }
  }
}

export default new MLService();
