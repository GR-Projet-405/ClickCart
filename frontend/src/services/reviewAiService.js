import { API_BASE_URL } from "../config/api";

async function postReviewAi(endpoint, content) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/ai/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || "AI review assistant request failed."
    );
  }

  return data;
}

export function improveReviewWriting(content) {
  return postReviewAi("improve-writing", content);
}

export function makeReviewClearer(content) {
  return postReviewAi("make-clearer", content);
}

export function checkReview(content) {
  return postReviewAi("check", content);
}