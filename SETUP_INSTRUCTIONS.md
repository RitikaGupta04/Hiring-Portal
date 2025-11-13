# Hirewise Faculty Recruitment System - Setup Instructions

## 🚀 Complete Setup Guide for Scoring, Ranking, and ML Integration

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (via Supabase)
- Git

### Step 1: Database Setup

1. **Run the database updates** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the entire content from database_updates.sql
   ```

2. **Create Supabase Storage Buckets**:
   ```sql
   -- Create storage buckets for documents
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('application-reports', 'application-reports', true);
   ```

3. **Verify tables are created**:
   - `scoring_criteria`
   - `application_scores`
   - `ml_model_results`
   - `application_documents`

### Step 2: Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd Hirewise-main/vite-admin/server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Update your Supabase configuration** in `config/db.js`:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY';
   ```

4. **Start the server**:
   ```bash
   npm run dev
   # or
   node server.js
   ```

### Step 3: Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd Hirewise-main/vite-admin/hirewise-admin-vite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Update Supabase client configuration** in `lib/supabase-client.js`:
   ```javascript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Step 4: Testing the System

1. **Submit a test application**:
   - Go to `http://localhost:5173/register`
   - Register a new user
   - Fill out the application form
   - Submit the application

2. **Check the admin dashboard**:
   - Go to `http://localhost:5173/admin/dashboard`
   - Verify that applications appear with scores and rankings
   - Test the filtering and sorting features

3. **Test document generation**:
   - Click "Report" button on any application
   - Verify PDF/HTML report is generated

4. **Test ML predictions**:
   - Use the API endpoint: `POST /api/ml/predict/{applicationId}`
   - Check the response for ML prediction results

## 🔧 API Endpoints

### Applications
- `POST /api/applications` - Submit new application (auto-scoring enabled)
- `GET /api/applications/rankings/top` - Get top ranked applications
- `GET /api/applications/:id/score` - Get application score breakdown
- `POST /api/applications/:id/recalculate-score` - Recalculate score

### Documents
- `POST /api/documents/generate/:applicationId` - Generate application report
- `GET /api/documents/reports/:applicationId` - Get all reports for application
- `GET /api/documents/content/:applicationId` - Get report content

### ML Predictions
- `POST /api/ml/predict/:applicationId` - Run ML prediction
- `GET /api/ml/predictions/:applicationId` - Get ML predictions history
- `GET /api/ml/performance` - Get model performance metrics
- `POST /api/ml/batch-predict` - Batch prediction for multiple applications

## 📊 Scoring System

### Scoring Criteria (Weighted)
1. **Education & Qualifications** (20%)
   - PhD: 40 points
   - Masters: 25 points
   - Bachelors: 15 points
   - University tier bonus: 10-30 points

2. **Research Experience** (25%)
   - Years of experience: 5-25 points
   - Research positions: 10-30 points
   - Prestigious institutions: 15 points

3. **Teaching Experience** (20%)
   - Years of experience: 10-30 points
   - Teaching positions: 8-25 points
   - Course diversity: 15 points

4. **Industry Experience** (15%)
   - Years of experience: 10-30 points
   - Senior positions: 25 points
   - Industry relevance: 20 points

5. **Publications & Citations** (10%)
   - Scopus papers: 10-40 points
   - Conference papers: 10-20 points
   - Edited books: 10-15 points
   - Research IDs: 15 points

6. **Awards & Recognition** (5%)
   - Awards mentioned: 50 points
   - High publications: 10-30 points
   - Education completion: 20 points

7. **Communication Skills** (5%)
   - Document completeness: 40 points
   - Application completeness: 30 points
   - Description quality: 15 points

## 🤖 ML Model Features

### Input Features
- Demographics (age, gender, nationality)
- Education (level, university tier, recency)
- Experience (years, teaching, research, industry)
- Research output (publications, citations, IDs)
- Application quality (completeness, descriptions)
- Career progression indicators

### Output Categories
- **Excellent** (85-100): Highly qualified candidates
- **Good** (70-84): Well-qualified candidates
- **Average** (55-69): Adequately qualified candidates
- **Below Average** (40-54): Marginally qualified candidates
- **Poor** (0-39): Underqualified candidates

## 📈 Ranking System

- Applications are ranked within each department and position
- Rankings are automatically updated when scores change
- Database triggers ensure real-time ranking updates
- Rankings are displayed in the admin dashboard

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies are correctly set

2. **Scoring Not Working**:
   - Check if scoring criteria are inserted
   - Verify application data completeness
   - Check server logs for errors

3. **Document Generation Fails**:
   - Ensure Supabase storage bucket exists
   - Check file permissions
   - Verify application data is complete

4. **ML Predictions Not Working**:
   - Check if application has sufficient data
   - Verify ML service is running
   - Check feature extraction logic

### Debug Mode

Enable debug logging by setting:
```javascript
// In server files
console.log('Debug: ', data);
```

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Security Considerations
1. Use environment variables for sensitive data
2. Implement proper authentication
3. Set up CORS properly
4. Use HTTPS in production
5. Implement rate limiting

## 📝 Next Steps

1. **Customize Scoring Criteria**: Modify weights and criteria in `scoringService.js`
2. **Integrate Real ML Model**: Replace simulated ML with actual model
3. **Add Email Notifications**: Notify candidates of status changes
4. **Implement Interview Scheduling**: Add calendar integration
5. **Add Analytics Dashboard**: Create detailed analytics views

## 🆘 Support

For issues or questions:
1. Check the console logs for errors
2. Verify database schema matches requirements
3. Ensure all dependencies are installed
4. Check API endpoint responses

---

**Note**: This system is designed to be scalable and can handle large numbers of applications. The scoring and ranking system provides fair, objective evaluation of candidates based on multiple criteria.
