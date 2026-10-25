import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";
const API_URL = `${API_BASE_URL}/favorites`;
async function request(path = "", options) {
  const response = await authFetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.detail || "Unable to update favorites. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}
export const getFavorites = () => request();
export async function addFavorite(targetType, targetId) {
  const result = await request("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetType, targetId }) });
  window.dispatchEvent(new Event("favorites-updated"));
  return result;
}
export async function removeFavorite(targetType, targetId) {
  await request(`/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, { method: "DELETE" });
  window.dispatchEvent(new Event("favorites-updated"));
}
