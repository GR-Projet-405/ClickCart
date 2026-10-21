import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";
export async function adminRequest(path, options = {}) {
  const response = await authFetch(`${API_BASE_URL}/admin/workspace${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.detail || `Request failed (${response.status})`);
  return data;
}
