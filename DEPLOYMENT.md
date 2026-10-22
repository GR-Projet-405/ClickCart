# Deployment checks

The UI build is deployable as static files from `frontend/dist`, but this is not a certification that every existing backend workflow is production-ready.

## Environment

- Build the frontend with `VITE_API_BASE_URL=https://your-api-host/api`. Do not put secrets in any `VITE_` variable.
- Enable `SPRING_PROFILES_ACTIVE=prod` on the backend.
- Set a unique random `JWT_SECRET` of at least 32 bytes, `AUTH_COOKIE_SECURE=true`, explicit HTTPS `CORS_ALLOWED_ORIGINS`, and database credentials through the hosting secret manager.
- The existing enabled-security chain requires the configured `JWT_ISSUER_URI` and `JWT_AUDIENCE` for its external OAuth provider. Configure that provider before enabling production. App-issued JWTs still use the app authentication filter.
- Use HTTPS, preferably serve frontend and `/api` under the same site. Leave `AUTH_COOKIE_SAME_SITE=Lax` for same-site hosting. Cross-site hosting requires a reviewed cookie/CSRF configuration.
- Configure SMTP for password reset and the existing media/storage integrations. Back up MongoDB. Create administrators with the documented database tool.
- Production startup refuses missing JWT secrets, insecure cookies, development security mode, wildcard/non-HTTPS CORS origins or enabled demo seeding.
- Configure the static host to rewrite frontend routes to `index.html`; do not rewrite `/api` requests. Add appropriate security headers at the proxy/static host, including `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and frame protection. Roll out a tested CSP covering only your actual API/media/map hosts.

## Still required before public launch

The existing payment backend includes simulated gateway flows. A real payment gateway and verified server webhooks are not implemented by the visual/theme work. Existing checkout, messaging, refund, pricing and file endpoints need a complete ownership/authorization audit. Some controllers still declare local/wildcard CORS settings; consolidate those against your deployment origins before launch. Moderation/support workflows previously shown as mock panels remain unimplemented.

Run real end-to-end booking/payment tests against the chosen integrations, confirm SMTP delivery and recovery, and test all three roles. Do not treat a successful frontend build as proof of production security. No deployment has been performed.

## Theme and carousel

All primary customer/provider/admin headers and auth screens include a theme toggle. Preference is stored locally as `clickcart-theme`, using the OS preference on first visit. The homepage carousel starts paused, supports previous/next, direct selection and keyboard arrows; optional playback pauses while hovered or focused and does not advance in hidden tabs.
