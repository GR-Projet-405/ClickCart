const API_BASE_URL = 'http://localhost:9001/api/v1/recommendations';

/**
 * Fetch filtered and scored provider recommendations from the backend.
 */
export async function fetchProviderMatches(serviceCategory = 'Plumbing', location = 'Panadura Town', maxDistance = 10.0) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/match?service=${encodeURIComponent(serviceCategory)}&location=${encodeURIComponent(location)}&maxDistance=${maxDistance}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching provider matches:', error);
    return [];
  }
}

/**
 * Fetch detailed breakdown and profile information for a specific provider.
 */
export async function fetchProviderDetails(providerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/provider/${providerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch provider profile.');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching provider details:', error);
    return null;
  }
}