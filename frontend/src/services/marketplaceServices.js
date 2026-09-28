import { API_BASE_URL } from "../config/api";

const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/services`;

function buildQueryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    search.append(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const marketplaceServicesApi = {
  async listActive(params = {}) {
    const response = await fetch(`${endpoint}${buildQueryString(params)}`);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(body?.detail || body?.message || "Services could not be loaded.");
    }

    if (body && typeof body === "object") {
      return body;
    }

    return {
      content: Array.isArray(body) ? body : [],
      page: 0,
      size: 0,
      totalElements: Array.isArray(body) ? body.length : 0,
      totalPages: 0,
      last: true,
    };
  },
};
