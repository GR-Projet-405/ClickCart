import axios from 'axios';

const API_BASE_URL = 'http://localhost:9001/api/v1/recommendations';

const normalizeRecommendationResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.providers)) return payload.providers;

  return [];
};

export const recommendationService = {
  async getMatchedProviders(
    service = 'Plumbing',
    location = 'Panadura Town',
    maxDistance = 10.0
  ) {
    console.log('Calling recommendation API...');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/match`,
        {
          params: {
            service,
            location,
            maxDistance
          }
        }
      );

      const normalizedData = normalizeRecommendationResponse(response?.data);

      console.log('Recommendation API response:', response.data);

      return {
        ...response.data,
        data: normalizedData,
        totalMatches: response.data?.totalMatches ?? normalizedData.length
      };
    } catch (error) {
      console.error('Recommendation API error:', error);

      return {
        status: 'ERROR',
        totalMatches: 0,
        data: []
      };
    }
  }
};