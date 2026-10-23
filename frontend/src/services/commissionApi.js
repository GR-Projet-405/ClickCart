import { authFetch } from "./authService";
import { API_BASE_URL } from "../config/api";
export const commissionFetch = (path, options) => authFetch(`${API_BASE_URL}${path.replace(/^\/api/, "")}`, options);
