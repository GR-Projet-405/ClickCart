import { API_BASE_URL } from "../config/api";
import { authFetch, getSessionUser } from "./authService";
async function request(path, options) {
 const response = await authFetch(`${API_BASE_URL}/bookings${path}`,options); const data = await response.json().catch(()=>null);
 if(!response.ok) throw new Error(data?.message || data?.error || "Unable to load your bookings. Please retry."); return data;
}
function ownId() { const user=getSessionUser(); if(!user || user.role!=="CUSTOMER") throw new Error("Sign in as a customer to view bookings."); return encodeURIComponent(user.id); }
export const fetchCustomerBookings = (_id,tab="upcoming") => request(`/customer/${ownId()}?tab=${encodeURIComponent(tab)}`);
export const fetchCustomerBookingSummary = () => request(`/customer/${ownId()}/summary`);
export const cancelBooking = (id,reason="") => request(`/${encodeURIComponent(id)}/cancel`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason})});
