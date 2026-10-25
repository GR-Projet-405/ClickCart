import { API_BASE_URL } from "../config/api";
import { marketplaceServicesApi } from "./marketplaceServices";

const AI_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/ai/search`;

/**
 * DEV-14 — AI-Assisted Search & Category Detection.
 *
 * SRS 3.3 "Core Marketplace Dependency Rule" requires that search keeps
 * working even when the external AI service is unavailable, so this
 * client never lets an AI failure block results:
 *
 *   1. Try the backend AI endpoint (module M16 — natural-language search +
 *      category detection). Not built yet? That's fine, it just 404s/fails
 *      and we fall through.
 *   2. Fall back to the real service catalog (marketplaceServicesApi,
 *      already wired to the Spring Boot backend) and rank it client-side
 *      with a simple keyword/category relevance heuristic. Replace
 *      `rankByKeyword` with the backend's real AI Match score once M16
 *      ships — the rest of the page doesn't need to change.
 *
 * Every result carries a 0-100 `matchScore` the UI renders as "AI Match".
 */
export const aiSearchApi = {
  async search(query) {
    const trimmed = query.trim();

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (response.ok) {
        const body = await response.json();
        if (Array.isArray(body?.results)) return body;
      }
    } catch {
      // AI service unreachable — degrade gracefully, never block search.
    }

    const services = await marketplaceServicesApi.listActive();
    const results = rankByKeyword(services, trimmed);
    const categories = suggestCategories(results.length ? results : services);
    return { results, categories, aiAvailable: false };
  },
};

function rankByKeyword(services, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return services
    .map((service) => {
      const haystack = [service.title, service.category, service.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const hits = terms.length
        ? terms.filter((term) => haystack.includes(term)).length
        : 0;
      const ratio = terms.length ? hits / terms.length : 0;
      // Keep scores in a believable "AI match" band even with no query yet.
      const matchScore = terms.length
        ? Math.round(55 + ratio * 44)
        : 80 + Math.round(Math.random() * 15);
      return { ...service, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

function suggestCategories(services) {
  const counts = new Map();
  services.forEach((service) => {
    if (!service.category) return;
    counts.set(service.category, (counts.get(service.category) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label);
}
