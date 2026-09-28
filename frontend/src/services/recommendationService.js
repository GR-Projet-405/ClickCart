import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/recommendations';

export const recommendationService = {
  /**
   * Fetch matching providers based on category, location, and distance.
   */
  async getMatchedProviders(service = 'Plumbing', location = 'Panadura', maxDistance = 10.0) {
    try {
      const response = await axios.get(`${API_BASE_URL}/match`, {
        params: { service, location, maxDistance }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations, attempting fallback...', error);
      // Fallback mechanism handling (AIF-007)
      return this.getFallbackProviders(service);
    }
  },

  /**
   * Fallback mechanism if primary engine fails
   */
  async getFallbackProviders(service) {
    try {
      const response = await axios.get(`${API_BASE_URL}/fallback`, {
        params: { service }
      });
      return response.data;
    } catch (err) {
      console.error('Fallback failed:', err);
      return { status: 'ERROR', totalMatches: 0, data: [] };
    }
  }
};