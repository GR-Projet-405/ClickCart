import { API_BASE_URL } from "../config/api";
import categoryService from "./categoryService";

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
 * back to the mock data in config/adminDashboardData.js.
 */

const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

/** Same contract as VerificationQueue.jsx: APPROVED goes through /status. */
export function decideVerification(id, decision) {
  if (decision === "approve") {
    return request(`/admin/providers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED" }),
    });
  }

  return request(`/admin/providers/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reasons: [], comments: "", sendEmail: false }),
  });
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

/**
 * Reuses the existing category service first. That service builds its URL
 * from VITE_API_BASE_URL directly, so if it cannot reach the API we retry
 * once with the shared API_BASE_URL constant before giving up.
 */
export async function fetchAdminCategories() {
  try {
    const payload = await categoryService.getAllCategoriesAdmin();
    const rows = asArray(payload).map(normaliseCategory);
    if (rows.length) return rows;
  } catch {
    // fall through to the shared-config retry below
  }

  const payload = await request("/admin/categories");
  return asArray(payload).map(normaliseCategory);
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
  decideVerification,
  fetchCommissionDashboard,
  fetchAuditLog,
  fetchAdminCategories,
};
