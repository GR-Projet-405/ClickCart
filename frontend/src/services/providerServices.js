import { API_BASE_URL } from "../config/api";

// Authentication is not part of the current foundation, so listings are scoped
// to one local provider until the provider session supplies its real identity.
export const LOCAL_PROVIDER_ID = "local-provider";

const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/provider/services`;

async function request(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
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
  return `?providerId=${encodeURIComponent(LOCAL_PROVIDER_ID)}`;
}

export const providerServicesApi = {
  list: () => request(providerQuery()),
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
};
