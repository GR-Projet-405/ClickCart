import { API_BASE_URL } from "../config/api";

// Temporary local-development provider identity.
// Replace this with the authenticated provider identity
// when the shared JWT/Auth integration is ready.
export const DEV_PROVIDER_ID = "provider-1";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function getProviderHeaders(providerId, includeContentType = false) {
  const headers = {
    "X-Provider-Id": providerId,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.detail ||
        "The review request could not be completed."
    );
  }

  return data;
}

export async function fetchProviderReviews(
  providerId = DEV_PROVIDER_ID
) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/provider/${encodeURIComponent(providerId)}`,
    {
      method: "GET",
      headers: getProviderHeaders(providerId),
    }
  );

  return parseResponse(response);
}

export async function fetchProviderRatingSummary(
  providerId = DEV_PROVIDER_ID
) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/provider/${encodeURIComponent(
      providerId
    )}/summary`,
    {
      method: "GET",
      headers: getProviderHeaders(providerId),
    }
  );

  return parseResponse(response);
}

export async function publishProviderResponse(
  reviewId,
  responseText,
  providerId = DEV_PROVIDER_ID
) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}/response`,
    {
      method: "POST",
      headers: getProviderHeaders(providerId, true),
      body: JSON.stringify({
        response: responseText,
      }),
    }
  );

  return parseResponse(response);
}
export async function fetchPublishedProviderReviews(
  providerId = DEV_PROVIDER_ID
) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/provider/${encodeURIComponent(
      providerId
    )}/published`,
    {
      method: "GET",
      headers: getProviderHeaders(providerId),
    }
  );

  return parseResponse(response);
}

export async function markReviewHelpful(reviewId) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: "POST",
      headers: getProviderHeaders(DEV_PROVIDER_ID),
    }
  );

  return parseResponse(response);
}

export async function reportReview(reviewId) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}/report`,
    {
      method: "POST",
      headers: getProviderHeaders(DEV_PROVIDER_ID),
    }
  );

  return parseResponse(response);
}