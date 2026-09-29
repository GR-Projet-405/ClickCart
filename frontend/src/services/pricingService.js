// frontend/src/services/pricingService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Helper to get the JWT token from localStorage (adjust key if your auth uses a different name)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Change "token" to your actual auth key if different
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const pricingService = {
  // --- PRICING ---
  getPricing: async (serviceId) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/pricing`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch pricing");
    return response.json();
  },

  savePricing: async (serviceId, pricingData) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/pricing`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(pricingData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save pricing");
    }
    return response.json();
  },

  // --- PACKAGES ---
  getPackages: async (serviceId) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/packages`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch packages");
    return response.json();
  },

  createPackage: async (serviceId, packageData) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/packages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(packageData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create package");
    }
    return response.json();
  },

  updatePackage: async (serviceId, packageId, packageData) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/packages/${packageId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(packageData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update package");
    }
    return response.json();
  },

  deletePackage: async (serviceId, packageId) => {
    const response = await fetch(`${API_BASE_URL}/providers/services/${serviceId}/packages/${packageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete package");
  },
};