import React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  onSessionChange,
  refreshSession,
  register as registerRequest,
} from "../services/authService";

/**
 * DEV-01 authentication state for the whole app.
 * status: "loading" while the session is restored from the refresh cookie, then
 * "authenticated" or "anonymous".
 */
const AuthContext = createContext(null);

// "/" currently redirects to the provider dashboard in AppRoutes, so customers land on the marketplace.
const HOME_BY_ROLE = {
  CUSTOMER: "/find-services",
  SERVICE_PROVIDER: "/provider/dashboard",
  PLATFORM_ADMIN: "/admin",
};

/** Landing page after login. The role always comes from the verified token, never from the UI. */
export function homePathForRole(role) {
  return HOME_BY_ROLE[role] || "/";
}

/** Whether a user with this role may be sent back to a page they originally requested. */
export function canReturnTo(role, path) {
  if (!path || path === "/" || path.startsWith("/login") || path.startsWith("/register")) return false;
  if (path.startsWith("/provider")) return role === "SERVICE_PROVIDER";
  if (path.startsWith("/admin")) return role === "PLATFORM_ADMIN";
  return role === "CUSTOMER";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsubscribe = onSessionChange((nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "authenticated" : "anonymous");
    });
    // Restore an existing session (page reload / new tab). No cookie simply means "anonymous".
    refreshSession().catch(() => setStatus("anonymous"));
    return unsubscribe;
  }, []);

  const login = useCallback((credentials) => loginRequest(credentials), []);
  const register = useCallback((details) => registerRequest(details), []);
  const logout = useCallback(() => logoutRequest(), []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
