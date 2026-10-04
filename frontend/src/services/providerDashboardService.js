import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";

export async function fetchProviderDashboard(range = "7d") {
  try {
    const response = await authFetch(`${API_BASE_URL}/provider/dashboard?range=${range}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch dashboard (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Provider dashboard fetch error:", error.message);
    throw error;
  }
}
