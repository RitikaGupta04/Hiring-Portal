const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const scopusApi = {
  /**
   * Fetch author profile by Scopus ID
   */
  async getAuthorProfile(scopusId) {
    const response = await fetch(`${API_URL}/api/scopus/author/${scopusId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch author profile');
    }
    
    return data.data;
  },

  /**
   * Fetch author's publications
   */
  async getAuthorDocuments(scopusId, count = 25) {
    const response = await fetch(`${API_URL}/api/scopus/documents/${scopusId}?count=${count}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch documents');
    }
    
    return data.data;
  },

  /**
   * Fetch complete author data (profile + publications)
   */
  async getCompleteData(scopusId) {
    const response = await fetch(`${API_URL}/api/scopus/complete/${scopusId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch complete data');
    }
    
    return data.data;
  },

  /**
   * Validate Scopus ID
   */
  async validateScopusId(scopusId) {
    const response = await fetch(`${API_URL}/api/scopus/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scopusId })
    });
    
    const data = await response.json();
    return data;
  }
};
