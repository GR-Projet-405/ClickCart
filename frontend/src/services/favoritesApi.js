import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/favorites`;

const DEFAULT_CUSTOMER_ID = "mock-customer-001";

/**
 * Fetch all favorites (services and providers) for the active customer.
 * 
 * @param {string} [customerId] Optional customer ID override
 * @returns {Promise<Array>} Array of favorite items
 */
export const getFavorites = async (customerId) => {
  const targetId = customerId || DEFAULT_CUSTOMER_ID;
  const res = await fetch(`${API_URL}/${targetId}`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch favorites (HTTP ${res.status})`);
  }
  return res.json();
};

/**
 * Add a service or provider to customer's favorites.
 * 
 * @param {"SERVICE"|"PROVIDER"} targetType 
 * @param {string} targetId 
 * @param {string} [customerId]
 * @returns {Promise<Object>}
 */
export const addFavorite = async (targetType, targetId, customerId) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      customerId: customerId || DEFAULT_CUSTOMER_ID,
      targetType: targetType.toUpperCase(),
      targetId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to add favorite (HTTP ${res.status})`);
  }
  return res.json();
};

/**
 * Remove a service or provider from customer's favorites.
 * 
 * @param {"SERVICE"|"PROVIDER"} targetType 
 * @param {string} targetId 
 * @param {string} [customerId]
 * @returns {Promise<boolean>}
 */
export const removeFavorite = async (targetType, targetId, customerId) => {
  const cId = customerId || DEFAULT_CUSTOMER_ID;
  const res = await fetch(`${API_URL}/${cId}/${targetType.toUpperCase()}/${targetId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to remove favorite (HTTP ${res.status})`);
  }
  return true;
};
