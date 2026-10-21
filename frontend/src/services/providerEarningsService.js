import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";
async function request(path, options) {
  const response = await authFetch(`${API_BASE_URL}/provider/earnings${path}`, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || "Unable to load earnings. Please try again.");
  return body;
}
export const providerEarningsService = {
  getSummary: (_providerId, period = "30days") => request(`/summary?period=${encodeURIComponent(period)}`),
  getTrends: () => request("/trends"),
  getCategoryBreakdown: () => request("/categories"),
  getTransactions: ({ search = "", status = "ALL", startDate, endDate, page = 0, size = 10 } = {}) => {
    const query = new URLSearchParams({ search, page: String(page), size: String(size) });
    if (status !== "ALL") query.set("status", status);
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    return request(`/transactions?${query}`);
  },
  requestPayout: (_providerId, data) => request("/payout", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }),
};
