import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";

/**
 * Customer Profile API Service
 * 
 * Interacts with:
 * - GET /api/customers/me/profile
 * - PUT /api/customers/me/profile
 */

/**
 * Fetch the active customer's profile using the authenticated session.
 * 
 * @returns {Promise<Object>} The customer profile object
 */
export async function getCustomerProfile() {
  const response = await authFetch(`${API_BASE_URL}/customers/me/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch customer profile (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Update the active customer's profile using the authenticated session.
 * 
 * @param {Object} updateData Profile fields to update
 * @returns {Promise<Object>} The updated customer profile object
 */
export async function updateCustomerProfile(updateData) {
  const response = await authFetch(`${API_BASE_URL}/customers/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to update customer profile (HTTP ${response.status})`
    );
  }

  return response.json();
}

