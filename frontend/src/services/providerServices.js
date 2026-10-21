import { authFetch } from "./authService";
import { API_BASE_URL } from "../config/api";


const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/provider/services`;

async function request(path, options = {}) {
  const response = await authFetch(`${endpoint}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(
      body?.detail || body?.message || body?.error || "The request could not be completed.",
    );
  }
  return body;
}

function providerQuery() {
  return "";
}

export const providerServicesApi = {
  list: () => request(providerQuery()),
  listPublic: async (providerId) => {
    const response = await fetch(`${API_BASE_URL}/public/providers/${encodeURIComponent(providerId)}/services`);
    if (!response.ok) throw new Error("Unable to load this provider's services.");
    return response.json();
  },
  create: (service) =>
    request(providerQuery(), { method: "POST", body: JSON.stringify(service) }),
  update: (id, service) =>
    request(`/${encodeURIComponent(id)}${providerQuery()}`, {
      method: "PUT",
      body: JSON.stringify(service),
    }),
  updateStatus: (id, status) =>
    request(`/${encodeURIComponent(id)}/status${providerQuery()}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (id) => request(`/${encodeURIComponent(id)}${providerQuery()}`, { method: "DELETE" }),
};
