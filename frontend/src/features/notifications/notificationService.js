import { API_BASE_URL } from "../config/api";

/**
 * Notification Center API client.
 *
 * Reads the API base URL via VITE_API_BASE_URL (frontend/src/config/api.js).
 * Sends the temporary X-User-Id header (DEV-33 seam) until DEV-01 real auth
 * lands — see docs/handover/DEV-33-notification-center.md.
 */

function authHeaders(extra = {}) {
  const userId = localStorage.getItem("cc_user_id") || "";
  return {
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...extra,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(options.headers),
    ...options,
  });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = (body && body.message) || message;
    } catch {
      // ignore non-JSON body
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function listNotifications(params = {}) {
  const search = new URLSearchParams();
  if (params.read !== undefined && params.read !== null) {
    search.set("read", String(params.read));
  }
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  const qs = search.toString() ? `?${search.toString()}` : "";
  return request(`/notifications${qs}`);
}

export async function getUnreadCount() {
  return request("/notifications/unread-count");
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllAsRead() {
  return request("/notifications/read-all", { method: "POST" });
}

export async function deleteNotification(id) {
  return request(`/notifications/${id}`, { method: "DELETE" });
}

export async function getPreferences() {
  return request("/notifications/preferences");
}

export async function updatePreferences(body) {
  return request("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function setCurrentUser(userId) {
  if (userId) {
    localStorage.setItem("cc_user_id", String(userId));
  } else {
    localStorage.removeItem("cc_user_id");
  }
}

export function clearCurrentUser() {
  localStorage.removeItem("cc_user_id");
}