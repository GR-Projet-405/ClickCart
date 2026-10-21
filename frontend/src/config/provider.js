import { getSessionUser } from "../services/authService";

export function getCurrentProviderId() {
  const user = getSessionUser();
  if (!user?.id || user.role !== "SERVICE_PROVIDER") throw new Error("Sign in to your provider account to continue.");
  return user.id;
}
