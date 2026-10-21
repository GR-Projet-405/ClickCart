import { API_BASE_URL } from "../config/api";
import { authFetch } from "./authService";
async function request(path, options) {
  const response = await authFetch(`${API_BASE_URL}/provider-verification${path}`, options);
  if (response.status === 404 && !options) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Unable to save verification details. Please try again.");
  return data;
}
export const providerVerificationService = {
  saveStepOne: (_userId, data) => request("/step1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  saveStepTwo: (_userId, nicFront, nicBack, businessCert) => {
    const body = new FormData();
    body.append("nicFront", nicFront);
    body.append("nicBack", nicBack);
    if (businessCert) body.append("businessCert", businessCert);
    return request("/step2", { method: "POST", body });
  },
  getByUserId: () => request(""),
};
