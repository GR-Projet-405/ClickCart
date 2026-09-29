# Authentication & Account Security (DEV-01)

Owner: DEV-01 (Rukshan Senevirathna) · Branch: `feature/DEV-01-Authentication-Account-Security`

Covers SRS **IAM-001 – IAM-012**, **SEC-002, SEC-003, SEC-007, SEC-014** and the Login / Register / Forgot-Reset Password screens.

- [How it works](#how-it-works)
- [Using auth in your feature](#using-auth-in-your-feature) ← start here if you own another feature
- [API reference](#api-reference)
- [Error codes](#error-codes)
- [Configuration](#configuration)
- [Data model](#data-model)
- [Known limitations and open items](#known-limitations-and-open-items)
- [Testing](#testing)

---

## How it works

| Piece | Behaviour |
|---|---|
| Roles | `CUSTOMER`, `SERVICE_PROVIDER`, `PLATFORM_ADMIN` (Spring authority `ROLE_<name>`). Providers also have `providerType`: `INDIVIDUAL` or `BUSINESS`. Only customers and providers can self-register. |
| Passwords | BCrypt (cost 12). Policy: 8–64 characters (max 72 bytes), upper- and lowercase letter, number. Enforced on the backend; the UI mirrors it. |
| Access token | JWT signed with HMAC-SHA (HS256–HS512, chosen by the length of `JWT_SECRET`), **15 minutes**, claims: `sub` = user id, `email`, `role`, `providerType`, `ver`. Returned in the response body. The React app keeps it **in memory only** (never `localStorage`). |
| Refresh token | 256-bit random value in the **httpOnly cookie `cc_refresh`** (path `/api/auth`, `SameSite=Lax`). Only its SHA-256 hash is stored. Rotated on every refresh; reusing an old token more than 30 s after rotation revokes **all** of that user's sessions. Lifetime: 24 h, or 30 days with "Keep me signed in". |
| Lockout | 5 wrong passwords → account locked for 15 minutes (atomic counter). A password reset unlocks it. |
| Rate limits (per IP) | login 10/min · register 10/15 min · email check 30/min · refresh 30/min · forgot-password 5/15 min · verify-code 10/15 min · reset-password 10/15 min. Response: `429` + `Retry-After`. |
| Password reset | Email → **6-digit code** (10 min, 5 tries, resend after 60 s) → single-use reset token (10 min) → new password. Resetting signs the user out on every device. The forgot-password response is identical for unknown emails. |
| Audit | Security events are logged to the `clickcart.audit.auth` logger (ids and outcomes only, never passwords, codes or tokens). |

### Session flow (frontend)

1. Login/Register returns `{ accessToken, user }` and sets the `cc_refresh` cookie.
2. On page load, `AuthProvider` calls `POST /api/auth/refresh` to restore the session from the cookie.
3. `authFetch()` sends `Authorization: Bearer <token>`; on a `401` it refreshes once and retries.
4. Logout revokes the refresh token and clears the cookie.

---

## Using auth in your feature

### Backend: who is the current user?

A valid token puts an `AuthenticatedUser` principal in the security context. `Principal#getName()` returns the **user id**, so existing code that reads `principal.getName()` keeps working.

```java
@GetMapping("/api/provider/things")
public List<ThingResponse> list(Principal principal) {
    String providerId = principal.getName();   // user id from the verified token
    return thingService.findForProvider(providerId);
}

// Or, when you also need the role / provider type:
@GetMapping("/api/customers/me/things")
public List<ThingResponse> mine(@AuthenticationPrincipal AuthenticatedUser user) {
    // user.id(), user.email(), user.role(), user.providerType()
}
```

- **Never trust a user id sent by the client** (`?providerId=`, `X-Provider-Id`, request body) for ownership checks (SRS API-007). Use the principal.
- Role rules live in `SecurityConfig` (`/api/provider/**` requires `SERVICE_PROVIDER`). Method-level checks work too: `@PreAuthorize("hasRole('PLATFORM_ADMIN')")`.
- While `CLICKCART_DEV_AUTH_FALLBACK=true`, requests **without** a token are still treated as the old development identity (`dev-provider-09`, or `X-Dev-Role` / `X-Provider-Id` headers). Its principal is a plain `String`, not `AuthenticatedUser`, so `@AuthenticationPrincipal AuthenticatedUser` is `null` in that case.

### Frontend: calling protected APIs

```jsx
import { authFetch } from "../services/authService";

const response = await authFetch(`${API_BASE_URL}/provider/service-areas`, {
  headers: { "Content-Type": "application/json" },
});
```

```jsx
import { useAuth } from "../context/AuthContext";

function AccountMenu() {
  const { user, status, logout } = useAuth(); // status: "loading" | "authenticated" | "anonymous"
  if (status !== "authenticated") return <Link to="/login">Log in</Link>;
  return <button onClick={logout}>Log out {user.fullName}</button>;
}
```

- To send someone to login and bring them back afterwards: `navigate("/login", { state: { from: location } })`.
- After login each role lands on: customer → `/find-services`, provider → `/provider/dashboard`, admin → `/admin`. New providers go to `/provider/profile/setup` after registering.

### Moving off the development fallback

1. Replace plain `fetch` with `authFetch` in your service file, and remove `X-Provider-Id` / `X-Dev-Role` headers.
2. Read the user id from `Principal` on the backend instead of request parameters or headers.
3. Test with `CLICKCART_DEV_AUTH_FALLBACK=false` in your `backend/.env`.

When every feature has migrated, the fallback can be deleted from `JwtAuthenticationFilter`.

---

## API reference

Base path `/api/auth`. Successes use the shared `ApiResponse` envelope (`success`, `message`, `data`, `timestamp`); errors use the shared `ErrorResponse` plus the auth fields described in [Error codes](#error-codes). Send requests with `credentials: "include"` so the refresh cookie works.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | public | Create a customer or provider account and sign in |
| POST | `/login` | public | Sign in |
| POST | `/refresh` | cookie | New access token (rotates the refresh cookie) |
| POST | `/logout` | cookie | Revoke the session and clear the cookie |
| GET | `/me` | Bearer | Current user |
| GET | `/email-availability?email=` | public | Live "Available" check on the register form |
| POST | `/forgot-password` | public | Send a 6-digit reset code |
| POST | `/verify-reset-code` | public | Exchange the code for a reset token |
| POST | `/reset-password` | public (reset token) | Set the new password |

### POST /register → `201`

```json
{
  "role": "SERVICE_PROVIDER",
  "providerType": "INDIVIDUAL",
  "fullName": "Kamal Perera",
  "phone": "+94 77 123 4567",
  "email": "kamal.perera@gmail.com",
  "password": "Secret123",
  "acceptedTerms": true
}
```

`providerType` is required for providers and ignored for customers. Phone accepts `+94…`, `07…` or `7…` and is stored as `+947XXXXXXXX`. Email is stored lower-cased.

Response `data` (same shape for login and refresh):

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "6ab8918b484b526b37c4a61d",
    "email": "kamal.perera@gmail.com",
    "fullName": "Kamal Perera",
    "phone": "+94771234567",
    "role": "SERVICE_PROVIDER",
    "providerType": "INDIVIDUAL",
    "status": "ACTIVE",
    "createdAt": "2026-09-27T03:46:19.568Z"
  }
}
```

Errors: `400` validation (`fieldErrors`), `400` admin role or missing provider type, `409` email already registered, `429`.

### POST /login → `200`

```json
{ "email": "kamal.perera@gmail.com", "password": "Secret123", "rememberMe": true }
```

Errors: `401 INVALID_CREDENTIALS` (same for unknown email and wrong password), `423 ACCOUNT_LOCKED`, `403 ACCOUNT_SUSPENDED`, `429`.

### POST /refresh → `200`, POST /logout → `200`

No body; both use the `cc_refresh` cookie. Refresh errors: `401 SESSION_EXPIRED`, `403 ACCOUNT_SUSPENDED`. Logout always succeeds and clears the cookie.

### GET /me → `200`

Header `Authorization: Bearer <accessToken>`. Returns the `user` object. `401` without a valid token.

### GET /email-availability?email=… → `200`

`data`: `{ "available": true }`. `400` for an invalid email.

### POST /forgot-password → `200`

```json
{ "email": "kamal.perera@gmail.com" }
```

Always the same response, whether or not the account exists:

```json
{ "codeExpiresInSeconds": 600, "resendAvailableInSeconds": 60 }
```

### POST /verify-reset-code → `200`

```json
{ "email": "kamal.perera@gmail.com", "code": "482190" }
```

`data`: `{ "resetToken": "…", "expiresInSeconds": 600 }`. Error: `400 INVALID_RESET_CODE`.

### POST /reset-password → `200`

```json
{ "resetToken": "…", "newPassword": "NewSecret456" }
```

`data`: `{ "changedAt": "2026-09-27T04:01:20.497Z" }`. Clears the refresh cookie. Errors: `400` password policy (`fieldErrors.newPassword`), `400 PASSWORD_REUSED`, `400 RESET_SESSION_EXPIRED`.

---

## Error codes

Auth errors add these fields to the shared `ErrorResponse` (omitted when not relevant):

| Field | Meaning |
|---|---|
| `code` | Machine-readable reason (below) |
| `attemptsRemaining` | Login attempts left before lockout; only sent when 2 or fewer remain |
| `lockedUntil` | ISO time when a locked account unlocks |
| `retryAfterSeconds` | Seconds to wait after a `429` (also in the `Retry-After` header) |

| Code | HTTP | When |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCOUNT_LOCKED` | 423 | Too many failed logins |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended by an admin |
| `SESSION_EXPIRED` | 401 | Missing, expired, revoked or reused refresh token |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `INVALID_RESET_CODE` | 400 | Wrong, expired or used reset code |
| `RESET_SESSION_EXPIRED` | 400 | Reset token expired or already used |
| `PASSWORD_REUSED` | 400 | New password equals the current one |

---

## Configuration

All values are read from `backend/.env` (never committed). Defaults apply when a variable is missing. See `backend/.env.example`.

| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | *(random per start)* | **Required outside local dev.** At least 32 bytes, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`. Without it, tokens stop working after every restart. |
| `JWT_ACCESS_TOKEN_TTL_MINUTES` | `15` | Access-token lifetime |
| `AUTH_SESSION_TTL_HOURS` | `24` | Refresh lifetime without "Keep me signed in" |
| `AUTH_REMEMBER_ME_TTL_DAYS` | `30` | Refresh lifetime with "Keep me signed in" |
| `AUTH_MAX_FAILED_LOGINS` | `5` | Failed logins before lockout |
| `AUTH_LOCKOUT_MINUTES` | `15` | Lockout duration |
| `AUTH_RATE_LIMIT_ENABLED` | `true` | Per-IP rate limits |
| `AUTH_RESET_CODE_TTL_MINUTES` | `10` | Reset code lifetime |
| `AUTH_RESET_RESEND_COOLDOWN_SECONDS` | `60` | Wait before a new code can be sent |
| `AUTH_RESET_CODE_MAX_ATTEMPTS` | `5` | Wrong codes allowed per code |
| `AUTH_RESET_TOKEN_TTL_MINUTES` | `10` | Reset token lifetime |
| `AUTH_COOKIE_SECURE` | `false` | **Set `true` in production (HTTPS).** |
| `AUTH_COOKIE_SAME_SITE` | `Lax` | Use `None` (with `Secure=true`) only if the frontend and API are on different sites |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated origins allowed to send the cookie |
| `CLICKCART_DEV_AUTH_FALLBACK` | `true` | **Set `false` in any shared or production environment.** See [Moving off the development fallback](#moving-off-the-development-fallback). |

`MONGODB_URI` must include the database name, e.g. `…mongodb.net/clickcart?appName=Cluster0`; without it the backend does not start.

---

## Data model

| Collection | Key fields | Indexes |
|---|---|---|
| `users` | `email` (lower-case), `passwordHash`, `fullName`, `phone`, `role`, `providerType`, `status`, `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`, `passwordChangedAt`, `tokenVersion`, `termsAcceptedAt`, `createdAt`, `updatedAt` | unique `email` |
| `refresh_tokens` | `userId`, `tokenHash`, `rememberMe`, `expiresAt`, `revokedAt`, `revokedReason` | unique `tokenHash`, `userId`, TTL on `expiresAt` |
| `password_reset_codes` | `userId`, `codeSalt`, `codeHash`, `failedAttempts`, `codeExpiresAt`, `verifiedAt`, `resetTokenHash`, `resetTokenExpiresAt`, `usedAt`, `invalidatedAt`, `purgeAt` | `userId + createdAt`, `resetTokenHash`, TTL on `purgeAt` (1 hour) |

Indexes are created on startup by `AuthIndexInitializer`. The user id (`users._id`) is the id other features should store as the owner reference.

---

## Known limitations and open items

| Item | Status |
|---|---|
| Reset code delivery | **Development only:** printed in the backend console (`[DEV ONLY] Password reset code for …`). Replace `ConsolePasswordResetCodeSender` with an email/SMS sender (or DEV-33 notifications) before production. |
| Admin accounts | Cannot self-register by design. There is no admin creation screen yet; create admins directly in the database until an admin-provisioning flow is agreed. |
| Access tokens after a password reset | Refresh tokens are revoked immediately; an already-issued access token remains valid until it expires (max 15 min). |
| Rate limiter | In-memory, per backend instance. Needs a shared store (e.g. Redis) if the backend is scaled out; behind a proxy, configure forwarded headers so the real client IP is used. |
| Customer profile on sign-up | Registration does not create the DEV-02 `customers` document yet, and `CurrentCustomerResolver` still returns the mock customer. To be integrated with DEV-02. |
| Provider profile on sign-up | New providers are sent to DEV-03's `/provider/profile/setup`; the profile is created there. |
| Social login | Google / Facebook buttons are shown disabled ("coming soon"). |
| MFA, token lifetimes | Current values are team defaults for SRS TBD-06 / TBD-07 and can be changed through configuration. |
| Header login/logout | The customer/provider/admin headers belong to their owners; add a login/logout control there with `useAuth()` when agreed. |

---

## Testing

Backend unit tests (no database needed):

```bash
cd backend
./mvnw test -Dtest='AuthServiceTest,RefreshTokenServiceTest,PasswordResetServiceTest,JwtUtilTest,PasswordPolicyTest,FixedWindowRateLimiterTest'
```

| Test class | Covers |
|---|---|
| `AuthServiceTest` | registration rules, login, lockout, suspended accounts, refresh, email check |
| `RefreshTokenServiceTest` | hashing, lifetimes, rotation, reuse detection, grace window |
| `PasswordResetServiceTest` | code generation/hashing, cooldown, wrong codes, reset, reuse, expiry |
| `JwtUtilTest` | claims, signature, expiry, tampering |
| `PasswordPolicyTest` | password rules, BCrypt byte limit, phone normalization |
| `FixedWindowRateLimiterTest` | limits, reset window, per-key counting |

Manual check (backend on `:8080`, frontend on `:5173`):

1. `/register` → create a provider → lands on `/provider/profile/setup`.
2. Log out (clear cookies) → `/login` → wrong password 5× → lockout banner with countdown.
3. "Reset password" → send code → copy the code from the backend console → set a new password.
4. Log in with the new password → lands on the role's workspace; reload the page → still signed in.
