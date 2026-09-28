// frontend/src/services/favoritesApi.js
const API_URL = 'http://localhost:8080/api/favorites';

// Temporary — replace with real logged-in user later
const CUSTOMER_ID = 'user123';

export const getFavorites = async () => {
  const res = await fetch(`${API_URL}/${CUSTOMER_ID}`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
};

export const removeFavorite = async (targetType, targetId) => {
  const res = await fetch(`${API_URL}/${CUSTOMER_ID}/${targetType}/${targetId}`, {
    method: 'DELETE',
  });
  return res.ok;
};
