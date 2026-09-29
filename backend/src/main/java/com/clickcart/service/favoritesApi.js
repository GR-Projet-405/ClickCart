// frontend/src/services/favoritesApi.js
const API_URL = 'http://localhost:8080/api/favorites';

const getToken = () => localStorage.getItem('token');

export const getFavorites = async () => {
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
};

export const addFavorite = async (targetType, targetId) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ targetType, targetId })
  });
  return response.json();
};

export const removeFavorite = async (targetType, targetId) => {
  const response = await fetch(`${API_URL}/${targetType}/${targetId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return response.ok;
};
