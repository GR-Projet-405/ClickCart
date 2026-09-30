import { API_BASE_URL } from "../config/api";

function buildHeaders() {
  return { "Content-Type": "application/json" };
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const body = await response.json();

  if (!response.ok) {
    const message =
      (body && body.message) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function getAvailabilityRules(providerId) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability`,
    { headers: buildHeaders() }
  );
  return handleResponse(response);
}

export async function getActiveAvailabilityRules(providerId) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability/active`,
    { headers: buildHeaders() }
  );
  return handleResponse(response);
}

export async function createAvailabilityRule(providerId, rule) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(rule),
    }
  );
  return handleResponse(response);
}

export async function updateAvailabilityRule(providerId, id, rule) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability/${id}`,
    {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(rule),
    }
  );
  return handleResponse(response);
}

export async function deleteAvailabilityRule(providerId, id) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability/${id}`,
    {
      method: "DELETE",
      headers: buildHeaders(),
    }
  );
  return handleResponse(response);
}

export async function getAvailabilitySlots(providerId, startDate, endDate) {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/availability/slots?${params}`,
    { headers: buildHeaders() }
  );
  return handleResponse(response);
}
