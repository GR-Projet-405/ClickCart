import { API_BASE_URL } from "../config/api";

export const DEMO_PROVIDER_TOKENS = {
  "provider-a":
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm92aWRlci1hIiwicm9sZSI6IlNFUlZJQ0VfUFJPVklERVIiLCJuYW1lIjoiS2F2aW5kYSBTaWx2YSIsImV4cCI6MTg5MzQ1NjAwMH0.GlRPiy13tj_uVOY4ETmvZ9A_co2LGemATcQWqtq_SUY",
  "provider-b":
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm92aWRlci1iIiwicm9sZSI6IlNFUlZJQ0VfUFJPVklERVIiLCJuYW1lIjoiUHJvdmlkZXIgQiIsImV4cCI6MTg5MzQ1NjAwMH0.YxinI48JHrN4j__ijQXhzmesEUFs3QvpyURWLx9H9pw",
};

const TOKEN_KEY = "clickcart.providerToken";
const PROVIDER_KEY = "clickcart.providerId";

export function getSelectedProviderId() {
  return localStorage.getItem(PROVIDER_KEY) || "provider-a";
}

export function getProviderToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    import.meta.env.VITE_PROVIDER_ACCESS_TOKEN ||
    DEMO_PROVIDER_TOKENS[getSelectedProviderId()] ||
    DEMO_PROVIDER_TOKENS["provider-a"]
  );
}

export function setDemoProvider(providerId) {
  localStorage.setItem(PROVIDER_KEY, providerId);
  localStorage.setItem(TOKEN_KEY, DEMO_PROVIDER_TOKENS[providerId]);
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${getProviderToken()}`,
    ...extra,
  };
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const data = await parseJson(response);
  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.body = data;
    throw error;
  }
  return data;
}

export function getProviderJobs(status) {
  const query = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/provider/jobs${query}`);
}

export function getProviderJobById(jobId) {
  return request(`/provider/jobs/${jobId}`);
}

export function acceptProviderJob(jobId) {
  return request(`/provider/jobs/${jobId}/accept`, { method: "PUT", body: "{}" });
}

export function startProviderJob(jobId) {
  return request(`/provider/jobs/${jobId}/start`, { method: "PUT", body: "{}" });
}

export function completeProviderJob(jobId, completionNotes) {
  return request(`/provider/jobs/${jobId}/complete`, {
    method: "PUT",
    body: JSON.stringify({ completionNotes: completionNotes || "" }),
  });
}

export function uploadCompletionProof(jobId, file) {
  const body = new FormData();
  body.append("file", file);
  return request(`/provider/jobs/${jobId}/proofs`, {
    method: "POST",
    body,
    headers: authHeaders(),
  });
}

export async function fetchProofObjectUrl(jobId, photoId) {
  const response = await fetch(`${API_BASE_URL}/provider/jobs/${jobId}/proofs/${photoId}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error("Unable to load photo");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
