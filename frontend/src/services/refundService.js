import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/refunds`;

/*
  Submit a new refund request.
  @param {Object} payload  - { bookingId, customerId, serviceName, amount, reason, description, evidenceUrls }
 */
export async function submitRefund(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit refund");
  }
  return res.json();
}

/*
  Fetch all refunds for a given customer.
  @param {string} customerId
 */
export async function getRefundsByCustomer(customerId) {
  const res = await fetch(`${BASE}/customer/${customerId}`);
  if (!res.ok) throw new Error("Failed to load refunds");
  return res.json();
}

/*
  Fetch a single refund by its MongoDB document id.
  @param {string} id
 */
export async function getRefundById(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Refund not found");
  return res.json();
}

/*
  Update the status of a refund (admin / internal).
  @param {string} id
  @param {string} status - "APPROVED" | "REJECTED" | "COMPLETED"
 */
export async function updateRefundStatus(id, status) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

/*
  Cancel (delete) a PENDING refund.
  @param {string} id
 */
export async function cancelRefund(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to cancel refund");
  return res.json();
}
