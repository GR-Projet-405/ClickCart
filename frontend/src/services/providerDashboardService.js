import { API_BASE_URL } from "../config/api";
import { getProviderToken } from "./providerJobService";

export async function fetchProviderDashboard(range = "7d") {
  try {
    const token = getProviderToken();
    const headers = {
      Accept: "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/provider/dashboard?range=${range}`, {
      headers,
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
