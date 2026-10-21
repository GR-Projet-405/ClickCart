import { API_BASE_URL } from "../config/api";
import { authFetch, getSessionUser } from "./authService";
async function request(path, body) {
 const response=await authFetch(`${API_BASE_URL}/checkout${path}`,body === undefined ? undefined : {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await response.json().catch(()=>null);
 if(!response.ok) throw new Error(data?.message || "Unable to complete the payment request. Please try again.");
 return data;
}
export const paymentService = {
 createPaymentIntent: data => request("/intent",data),
 processPayment: data => request("/process",data),
 getPaymentById: id => request(`/${encodeURIComponent(id)}`),
 getReceipt: id => request(`/receipt/${encodeURIComponent(id)}`),
 getCustomerPaymentHistory: () => { const user=getSessionUser(); if(!user || user.role!=="CUSTOMER") throw new Error("Sign in as a customer to view payments."); return request(`/customer/${encodeURIComponent(user.id)}`); },
 handleWebhook: data => request("/webhook",data),
};
