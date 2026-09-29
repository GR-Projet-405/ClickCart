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

export async function getBlockedDates(providerId) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/blocked-dates`,
    { headers: buildHeaders() }
  );
  return handleResponse(response);
}

export async function createBlockedDate(providerId, blockedDate) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/blocked-dates`,
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(blockedDate),
    }
  );
  return handleResponse(response);
}

export async function updateBlockedDate(providerId, id, blockedDate) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/blocked-dates/${id}`,
    {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(blockedDate),
    }
  );
  return handleResponse(response);
}

export async function deleteBlockedDate(providerId, id) {
  const response = await fetch(
    `${API_BASE_URL}/providers/${providerId}/blocked-dates/${id}`,
    {
      method: "DELETE",
      headers: buildHeaders(),
    }
  );
  return handleResponse(response);
}
