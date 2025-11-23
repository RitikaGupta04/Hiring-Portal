# Scopus Auto-Fetch Integration

This feature automatically fetches research paper information from Scopus when a candidate enters their 11-digit Scopus ID during registration.

## Setup Instructions

### 1. Get Scopus API Key

1. Go to https://dev.elsevier.com/
2. Create an account or sign in
3. Navigate to "API Products" → "Scopus Search API"
4. Create a new API key
5. Copy your API key

### 2. Configure Environment Variable

Add your Scopus API key to the server's `.env` file:

```bash
# In vite-admin/server/.env
SCOPUS_API_KEY=your_actual_api_key_here
```

### 3. Restart the Backend Server

After adding the API key, restart your Node.js backend server for the changes to take effect.

## How It Works

### For Candidates (Registration Form)

1. Navigate to the **Research Information** step in the registration form
2. Enter your 11-digit Scopus ID in the "Scopus ID" field
3. After entering 10-11 digits, the system will automatically:
   - Fetch your author profile from Scopus
   - Retrieve your publication data
   - Auto-fill the following fields:
     - **Journal Papers**: Number of Scopus-indexed journal publications
     - **Conference Papers**: Number of Scopus-indexed conference papers
     - **Books**: Number of books/edited books
     - **ORCID ID**: If available in your Scopus profile
4. You'll see a confirmation alert showing:
   - H-Index
   - Total documents
   - Total citations
   - Breakdown by publication type

### For Admins (Candidate Details)

The admin panel automatically displays comprehensive Scopus data for each candidate including:
- H-Index
- Total publications
- Total citations
- Publication breakdown by type
- Recent publications list

## API Endpoints

### Backend Routes

```javascript
// Fetch author profile
GET /api/scopus/author/:scopusId

// Fetch author's publications
GET /api/scopus/documents/:scopusId?count=25

// Fetch complete data (profile + publications)
GET /api/scopus/complete/:scopusId

// Validate Scopus ID
POST /api/scopus/validate
Body: { "scopusId": "12345678900" }
```

## Frontend Usage

### Import the API client

```javascript
import { scopusApi } from '../lib/scopusApi';
```

### Fetch complete author data

```javascript
const data = await scopusApi.getCompleteData(scopusId);
console.log(data.summary);
// {
//   scopusId: "12345678900",
//   hIndex: 15,
//   totalDocuments: 45,
//   totalCitations: 678,
//   journalPapers: 30,
//   conferencePapers: 12,
//   books: 3,
//   orcidId: "0000-0001-2345-6789"
// }
```

## Features

✅ **Auto-fetch on input**: Data is fetched automatically when Scopus ID is entered  
✅ **Real-time validation**: Validates ID format before making API calls  
✅ **Loading indicators**: Shows "Fetching data..." status during API calls  
✅ **Error handling**: Gracefully handles API errors with user-friendly messages  
✅ **Auto-fill form fields**: Automatically populates research paper counts  
✅ **Comprehensive data**: Includes H-index, citations, publication breakdowns  
✅ **Debounced requests**: Prevents excessive API calls during typing  

## Data Fetched

### Author Profile
- Scopus ID
- Author name
- H-Index
- Total document count
- Total citation count
- Current affiliation
- ORCID ID (if available)
- Subject areas

### Publications
- Title
- Publication name
- Publication date
- Citation count
- Publication type (Journal/Conference/Book)
- DOI
- Authors
- Open access status

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Scopus API key not configured" | API key missing from .env | Add `SCOPUS_API_KEY` to .env file |
| "Invalid Scopus ID format" | ID not 10-11 digits | Enter valid 11-digit Scopus ID |
| "Failed to fetch author profile" | Invalid/non-existent ID | Verify Scopus ID is correct |
| API rate limit exceeded | Too many requests | Wait and try again later |

## Rate Limits

Scopus API has rate limits depending on your subscription:
- **Free tier**: 5,000 requests per week
- **Institutional**: Higher limits based on subscription

The system includes built-in rate limiting (100 requests per 15 minutes per IP) to prevent abuse.

## Testing

### Test with a known Scopus ID

```bash
# Test the API directly
curl http://localhost:5000/api/scopus/complete/57221259107
```

Replace `57221259107` with an actual Scopus Author ID.

## Troubleshooting

### Issue: "Failed to fetch Scopus data"

**Solutions:**
1. Verify API key is correctly set in `.env`
2. Check if backend server is running
3. Verify Scopus ID is valid (11 digits)
4. Check internet connection
5. Review server logs for detailed error messages

### Issue: Auto-fetch not triggering

**Solutions:**
1. Ensure you've entered exactly 10-11 digits
2. Check browser console for errors
3. Verify frontend API URL is correct
4. Ensure backend `/api/scopus/*` routes are accessible

## Files Modified/Created

### Backend
- ✅ `server/services/scopusService.js` - Scopus API integration service
- ✅ `server/routes/scopus.js` - API endpoints for Scopus data
- ✅ `server/server.js` - Added Scopus routes
- ✅ `server/.env` - Added SCOPUS_API_KEY configuration

### Frontend
- ✅ `src/lib/scopusApi.js` - Frontend API client for Scopus
- ✅ `src/components/Components/MultiStepForm/CombinedMultiStepForm.jsx` - Auto-fetch integration
- ✅ Package installed: `axios` (for HTTP requests)

## Next Steps

1. Get your Scopus API key from https://dev.elsevier.com/
2. Add the key to `vite-admin/server/.env`
3. Restart the backend server
4. Test by entering a Scopus ID in the registration form
5. Optionally: Enhance admin panel to display full Scopus data visualization

## Support

For API documentation, visit: https://dev.elsevier.com/documentation.html

For Scopus Author ID lookup: https://www.scopus.com/freelookup/form/author.uri
