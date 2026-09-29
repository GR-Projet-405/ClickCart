import { API_BASE_URL } from "../config/api";

/**
 * DEV-01 Authentication API client.
 *
 * - The access token (15 min) is kept in memory only, never in localStorage, so injected scripts cannot
 *   read it from storage. A page reload restores the session through the httpOnly refresh cookie.
 * - Requests use credentials: "include" so the browser sends/receives the refresh cookie.
 * - Other features can call authFetch() to send authenticated requests with automatic token refresh.
 */

const AUTH_URL = `${API_BASE_URL.replace(/\/$/, "")}/auth`;

let accessToken = null;
let refreshInFlight = null;
const sessionListeners = new Set();

export class AuthApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (HTTP ${status})`);
    this.name = "AuthApiError";
    this.status = status;
    this.code = body?.code || null;
    this.fieldErrors = body?.fieldErrors || null;
    this.attemptsRemaining = body?.attemptsRemaining ?? null;
    this.lockedUntil = body?.lockedUntil || null;
    this.retryAfterSeconds = body?.retryAfterSeconds ?? null;
  }
}

const NETWORK_ERROR = {
  code: "NETWORK_ERROR",
  message: "We can't reach ClickCart right now. Check your connection and try again.",
};

async function request(path, { method = "GET", body, signal, auth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`${AUTH_URL}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new AuthApiError(0, NETWORK_ERROR);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new AuthApiError(response.status, payload);
  return payload?.data ?? null;
}

function setSession(session) {
  accessToken = session?.accessToken ?? null;
  const user = session?.user ?? null;
  sessionListeners.forEach((listener) => listener(user));
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Current in-memory access token, or null when signed out. */
export function getAccessToken() {
  return accessToken;
}

/** Subscribe to sign-in/sign-out changes. Returns an unsubscribe function. */
export function onSessionChange(listener) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export async function login({ email, password, rememberMe }) {
  const session = await request("/login", {
    method: "POST",
    body: { email: email.trim(), password, rememberMe: Boolean(rememberMe) },
  });
  setSession(session);
  return session.user;
}

export async function register(details) {
  const session = await request("/register", { method: "POST", body: details });
  setSession(session);
  return session.user;
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one request.
 * One retry covers another tab having just rotated the cookie.
 */
export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        let session;
        try {
          session = await request("/refresh", { method: "POST" });
        } catch (error) {
          if (error.code !== "SESSION_EXPIRED") throw error;
          await wait(400);
          session = await request("/refresh", { method: "POST" });
        }
        setSession(session);
        return session.user;
      } catch (error) {
        if (error.status === 401 || error.status === 403) setSession(null);
        throw error;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function logout() {
  try {
    await request("/logout", { method: "POST" });
  } finally {
    setSession(null);
  }
}

export function getCurrentUser() {
  return request("/me", { auth: true });
}

export async function checkEmailAvailability(email, signal) {
  const data = await request(`/email-availability?email=${encodeURIComponent(email.trim())}`, { signal });
  return Boolean(data?.available);
}

export function requestPasswordReset(email) {
  return request("/forgot-password", { method: "POST", body: { email: email.trim() } });
}

export function verifyResetCode(email, code) {
  return request("/verify-reset-code", { method: "POST", body: { email: email.trim(), code } });
}

export function resetPassword(resetToken, newPassword) {
  return request("/reset-password", { method: "POST", body: { resetToken, newPassword } });
}

/**
 * fetch() for other features' protected APIs: adds the Bearer token and, on a 401,
 * refreshes the session once and retries.
 */
export async function authFetch(url, options = {}) {
  const send = () => {
    const headers = new Headers(options.headers || {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(url, { ...options, headers });
  };

  let response = await send();
  if (response.status === 401) {
    try {
      await refreshSession();
      response = await send();
    } catch {
      // Still unauthenticated; return the original 401 response.
    }
  }
  return response;
}
