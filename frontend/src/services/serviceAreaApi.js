import { API_BASE_URL } from "../config/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Development fallback provider context for local testing
    headers["X-Provider-Id"] = "dev-provider-09";
    headers["X-Dev-Role"] = "SERVICE_PROVIDER";
  }
  return headers;
};

export async function fetchServiceAreas({
  page = 0,
  size = 8,
  search = "",
  status = "",
  district = "",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", size.toString());
  if (search.trim()) params.set("search", search.trim());
  if (status && status !== "ALL") params.set("status", status);
  if (district.trim()) params.set("district", district.trim());

  const response = await fetch(`${API_BASE_URL}/provider/service-areas?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to load service areas");
  }
  return json.data;
}

export async function fetchSummary() {
  const response = await fetch(`${API_BASE_URL}/provider/service-areas/summary`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to load summary statistics");
  }
  return json.data;
}

export async function fetchServiceAreaById(id) {
  const response = await fetch(`${API_BASE_URL}/provider/service-areas/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to fetch service area details");
  }
  return json.data;
}

export async function createServiceArea(payload) {
  const response = await fetch(`${API_BASE_URL}/provider/service-areas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.message || "Failed to create service area");
    error.fieldErrors = json.fieldErrors;
    error.status = response.status;
    throw error;
  }
  return json.data;
}

export async function updateServiceArea(id, payload) {
  const response = await fetch(`${API_BASE_URL}/provider/service-areas/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    const error = new Error(json.message || "Failed to update service area");
    error.fieldErrors = json.fieldErrors;
    error.status = response.status;
    throw error;
  }
  return json.data;
}

export async function updateServiceAreaStatus(id, activeOrStatus) {
  const body = typeof activeOrStatus === "boolean" 
    ? { active: activeOrStatus } 
    : { status: activeOrStatus };

  const response = await fetch(`${API_BASE_URL}/provider/service-areas/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to update status");
  }
  return json.data;
}

export async function deleteServiceArea(id) {
  const response = await fetch(`${API_BASE_URL}/provider/service-areas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to delete service area");
  }
  return json.data;
}

export async function fetchDistricts() {
  try {
    const response = await fetch(`${API_BASE_URL}/public/locations/districts`);
    const json = await response.json();
    return json.data || [];
  } catch (e) {
    return [
      "Western Province",
      "Central Province",
      "Southern Province",
      "Northern Province",
      "Eastern Province",
      "North Western Province",
      "North Central Province",
      "Uva Province",
      "Sabaragamuwa Province",
      "Colombo",
      "Gampaha",
      "Kalutara",
      "Kandy",
      "Matale",
      "Nuwara Eliya",
      "Galle",
      "Matara",
      "Hambantota",
      "Jaffna"
    ];
  }
}

export async function fetchLocationPresets() {
  try {
    const response = await fetch(`${API_BASE_URL}/public/locations/presets`);
    const json = await response.json();
    return json.data || {};
  } catch (e) {
    return {};
  }
}
