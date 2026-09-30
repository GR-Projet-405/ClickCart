import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";

async function readJson(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load notifications.");
  }
  return payload?.data ?? null;
}

export function fetchUnreadCount() {
  return authFetch(`${API_BASE_URL}/notifications/unread-count`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  }).then(readJson);
}

export function fetchNotificationPreferences() {
  return authFetch(`${API_BASE_URL}/notification-preferences`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  }).then(readJson);
}

export function saveNotificationPreferences(enabled) {
  return authFetch(`${API_BASE_URL}/notification-preferences`, {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  }).then(readJson);
}
