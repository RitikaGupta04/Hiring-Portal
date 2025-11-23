import axios from 'axios';

/**
 * Scopus API Service
 * Fetches author information and publication data from Scopus using Scopus ID
 * 
 * IMPORTANT: You need to add SCOPUS_API_KEY to your .env file
 * Get your API key from: https://dev.elsevier.com/
 */

class ScopusService {
  constructor() {
    this.apiKey = process.env.SCOPUS_API_KEY;
    this.baseUrl = 'https://api.elsevier.com/content';
    
    if (!this.apiKey) {
      console.warn('⚠️  SCOPUS_API_KEY not found in environment variables. Scopus features will not work.');
    }
  }

  /**
   * Fetch author profile information by Scopus ID
   * @param {string} scopusId - The Scopus Author ID (format: 12345678900)
   * @returns {Promise<Object>} Author information including h-index, document count, etc.
   */
  async getAuthorProfile(scopusId) {
    if (!this.apiKey) {
      throw new Error('Scopus API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/author/author_id/${scopusId}`, {
        headers: {
          'X-ELS-APIKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          view: 'ENHANCED'
        }
      });

      const authorData = response.data['author-retrieval-response'][0];
      const coredata = authorData.coredata;
      const metrics = authorData['h-index'];
      
      return {
        scopusId: scopusId,
        authorName: coredata['dc:identifier']?.split(':')[1] || 'Unknown',
        hIndex: parseInt(metrics) || 0,
        documentCount: parseInt(coredata['document-count']) || 0,
        citationCount: parseInt(coredata['citation-count']) || 0,
        affiliationCurrent: authorData['affiliation-current']?.['affiliation-name'] || null,
        subjectAreas: authorData['subject-areas']?.['subject-area']?.map(sa => sa.$) || [],
        orcidId: coredata['orcid'] || null
      };
    } catch (error) {
      console.error('Error fetching author profile from Scopus:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Scopus author profile: ${error.response?.data?.['service-error']?.status?.statusText || error.message}`);
    }
  }

  /**
   * Search for documents by author using Scopus ID
   * @param {string} scopusId - The Scopus Author ID
   * @param {number} count - Maximum number of results (default 25, max 200)
   * @returns {Promise<Object>} Search results with publication list
   */
  async searchAuthorDocuments(scopusId, count = 25) {
    if (!this.apiKey) {
      throw new Error('Scopus API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search/scopus`, {
        headers: {
          'X-ELS-APIKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          query: `AU-ID(${scopusId})`,
          count: Math.min(count, 200),
          sort: '-coverDate' // Sort by most recent
        }
      });

      const results = response.data['search-results'];
      const totalResults = parseInt(results['opensearch:totalResults']) || 0;
      const entries = results['entry'] || [];

      // Parse publication types
      const publicationsByType = {
        journal: 0,
        conference: 0,
        book: 0,
        bookChapter: 0,
        other: 0
      };

      const publications = entries.map(entry => {
        const subtype = entry['subtypeDescription'] || entry['subtype'] || 'Unknown';
        const aggregationType = entry['prism:aggregationType'];

        // Count by type
        if (aggregationType === 'Journal') publicationsByType.journal++;
        else if (subtype.toLowerCase().includes('conference')) publicationsByType.conference++;
        else if (subtype.toLowerCase().includes('book chapter')) publicationsByType.bookChapter++;
        else if (aggregationType === 'Book') publicationsByType.book++;
        else publicationsByType.other++;

        return {
          eid: entry['eid'],
          doi: entry['prism:doi'] || null,
          title: entry['dc:title'],
          publicationName: entry['prism:publicationName'],
          coverDate: entry['prism:coverDate'],
          citedByCount: parseInt(entry['citedby-count']) || 0,
          subtype: subtype,
          aggregationType: aggregationType,
          authors: entry['dc:creator'] || entry['author']?.[0]?.['authname'] || 'Unknown',
          issn: entry['prism:issn'] || null,
          volume: entry['prism:volume'] || null,
          pageRange: entry['prism:pageRange'] || null,
          openAccess: entry['openaccess'] === '1' || entry['openaccess'] === 1
        };
      });

      return {
        totalResults,
        resultsRetrieved: entries.length,
        publicationsByType,
        publications
      };
    } catch (error) {
      console.error('Error searching Scopus documents:', error.response?.data || error.message);
      throw new Error(`Failed to search Scopus documents: ${error.response?.data?.['service-error']?.status?.statusText || error.message}`);
    }
  }

  /**
   * Get comprehensive author data combining profile and publications
   * @param {string} scopusId - The Scopus Author ID (11 digits)
   * @returns {Promise<Object>} Complete author data
   */
  async getCompleteAuthorData(scopusId) {
    if (!scopusId || !/^\d{10,11}$/.test(scopusId)) {
      throw new Error('Invalid Scopus ID format. Expected 10-11 digit number.');
    }

    try {
      // Fetch both profile and publications in parallel
      const [profile, documents] = await Promise.all([
        this.getAuthorProfile(scopusId),
        this.searchAuthorDocuments(scopusId, 100)
      ]);

      return {
        profile,
        documents,
        summary: {
          scopusId: profile.scopusId,
          hIndex: profile.hIndex,
          totalDocuments: profile.documentCount,
          totalCitations: profile.citationCount,
          journalPapers: documents.publicationsByType.journal,
          conferencePapers: documents.publicationsByType.conference,
          books: documents.publicationsByType.book,
          bookChapters: documents.publicationsByType.bookChapter,
          orcidId: profile.orcidId,
          currentAffiliation: profile.affiliationCurrent
        }
      };
    } catch (error) {
      console.error('Error fetching complete author data:', error.message);
      throw error;
    }
  }
}

export default new ScopusService();
