import { API_BASE_URL } from "../config/api";

/**
 * Fetches paginated settlement tracking data from the backend.
 *
 * GET /api/provider/settlements
 *   ?page=1 &pageSize=10 &search= &dateFilter=Today &stateFilter=
 */
export async function fetchSettlements({
  page = 1,
  pageSize = 10,
  search = "",
  dateFilter = "Today",
  stateFilter = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    search,
    dateFilter,
    stateFilter,
  });

  const res = await fetch(`${API_BASE_URL}/provider/settlements?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Server error ${res.status}`);
  }

  return res.json();
}

/**
 * Creates a new settlement record.
 *
 * POST /api/provider/settlements
 *
 * @param {object} payload
 * @param {string}  payload.merchantRecipient
 * @param {number}  payload.amount              – gross amount in LKR
 * @param {string}  payload.captureDate         – yyyy-MM-dd
 * @param {string}  payload.settlementDate      – yyyy-MM-dd
 * @param {string}  payload.payoutMethod
 * @param {string}  payload.financeState
 *
 * @returns {Promise<SettlementRow>} the newly created row
 */
export async function createSettlement(payload) {
  const res = await fetch(`${API_BASE_URL}/provider/settlements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create settlement (${res.status})`);
  }

  return res.json();
}
