import { API_BASE_URL } from "../config/api";

const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/services`;

export const marketplaceServicesApi = {
  async listActive() {
    const response = await fetch(endpoint);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(body?.detail || body?.message || "Services could not be loaded.");
    }
    return Array.isArray(body) ? body : [];
  },
};
