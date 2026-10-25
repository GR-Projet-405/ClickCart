import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";

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
  const response = await authFetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

export function getProviderJobs(status, year, month) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") {
    params.append("status", status);
  }
  if (year != null && month != null) {
    params.append("year", year);
    params.append("month", month);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
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
  });
}

export async function fetchProofObjectUrl(jobId, photoId) {
  const response = await authFetch(`${API_BASE_URL}/provider/jobs/${jobId}/proofs/${photoId}`);
  if (!response.ok) {
    throw new Error("Unable to load photo");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function createCustomJob(jobData) {
  return request(`/provider/jobs`, {
    method: "POST",
    body: JSON.stringify(jobData),
  });
}
