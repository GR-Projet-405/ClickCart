import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";

/**
 * Platform Admin Dashboard data access (Phase 3).
 *
 * Reuses the endpoints that already power the existing admin features:
 *   GET    /admin/providers/verifications      (VerificationQueue.jsx)
 *   PATCH  /admin/providers/{id}/status        (VerificationQueue.jsx approve)
 *   PATCH  /admin/providers/{id}/reject        (VerificationQueue.jsx reject)
 *   GET    /admin/commission/dashboard         (CommissionDashboard.jsx)
 *   GET    /admin/commission/audit-logs        (CommissionDashboard.jsx)
 *   GET    /admin/categories                   (categoryService.js)
 *
 * `API_BASE_URL` comes from src/config/api.js — no hardcoded host, no new
 * backend endpoints. Every function rejects on failure so callers can fall
 * to an explicit error state. No sample records are substituted.
 */

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await authFetch(`${API_BASE_URL}${path}`, {
    headers: JSON_HEADERS,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`${path} responded with HTTP ${response.status}`);
  }

  return response.json();
}

/** Accepts a bare array or the paginated shapes used elsewhere in the app. */
function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.content || payload?.data || payload?.categories || [];
}

/* ------------------------------------------------------------------ *
 * Provider verification queue
 * ------------------------------------------------------------------ */

export async function fetchVerifications() {
  const payload = await request("/admin/providers/verifications");
  return asArray(payload).map(normaliseProvider);
}

/** Maps ProviderResponseDto onto the stable shape the preview renders. */
function normaliseProvider(provider) {
  const source = provider || {};
  return {
    id: source.id ?? source._id ?? null,
    name: source.ownerName || source.businessName || source.name || "Provider",
    category: source.category || source.serviceCategory || "General Service",
    submittedAt:
      source.createdAt || source.date || source.submittedDate || null,
    avatar:
      source.avatar ||
      source.profilePic ||
      source.profilePicture ||
      source.imageUrl ||
      source.profileImage ||
      null,
    status: String(source.status || "PENDING").toUpperCase(),
  };
}

/* ------------------------------------------------------------------ *
 * Commission dashboard (revenue + trend)
 * ------------------------------------------------------------------ */

export async function fetchCommissionDashboard() {
  const payload = await request("/admin/commission/dashboard");
  return {
    totalRevenue: payload?.totalRevenue ?? null,
    revenueTrend: normaliseTrend(payload?.revenueTrend),
  };
}

/** CommissionChart expects [{ value, date, id }]. */
function normaliseTrend(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((item, index) => {
      const raw =
        typeof item === "number"
          ? item
          : item?.value ?? item?.amount ?? item?.revenue ?? item?.commission;
      const value = Number(raw);

      if (!Number.isFinite(value)) return null;

      return {
        value,
        date: typeof item === "object" ? item?.date ?? item?.day ?? null : null,
        id: item?.id ?? item?.label ?? `Day ${index + 1}`,
      };
    })
    .filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * Audit log (recent admin actions)
 * ------------------------------------------------------------------ */

export async function fetchAuditLog() {
  const payload = await request("/admin/commission/audit-logs");
  return asArray(payload).map((entry, index) => ({
    id: `${entry?.timestamp ?? "audit"}-${index}`,
    action: entry?.action ?? "Administrative action",
    actor: entry?.actor ?? "Platform Admin",
    rule: entry?.rule ?? "",
    timestamp: entry?.timestamp ?? null,
  }));
}

/* ------------------------------------------------------------------ *
 * Service categories
 * ------------------------------------------------------------------ */

export async function fetchAdminCategories() {
  return asArray(await request("/admin/categories")).map(normaliseCategory);
}

function normaliseCategory(category) {
  const subcategories = Array.isArray(category?.subcategories)
    ? category.subcategories
    : [];

  return {
    id: category?.id ?? category?._id ?? null,
    name: category?.name ?? "Unnamed category",
    icon: category?.icon || null,
    services: Number(category?.subcategoriesCount ?? subcategories.length) || 0,
    active: category?.active !== false,
  };
}

export default {
  fetchVerifications,
  fetchCommissionDashboard,
  fetchAuditLog,
  fetchAdminCategories,
};
