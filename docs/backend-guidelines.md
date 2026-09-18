# ClickCart backend guidelines

The backend uses the base package `com.clickcart` and the following responsibility boundaries:

- `controller` — HTTP request and response handling only. Controllers delegate work rather than containing business logic.
- `service` — application and business logic.
- `repository` — MongoDB persistence access.
- `model` — MongoDB documents and persistence-oriented domain structures.
- `dto` — request and response payloads at system boundaries.
- `exception` — shared exception types and error-handling infrastructure.
- `config` — cross-cutting Spring configuration.
- `util` — small, stateless, reusable utilities only.

Keep dependencies flowing from the HTTP layer toward services and repositories. Do not expose persistence models as API contracts by default. Validate request DTOs at the API boundary.

Shared domain structures and cross-feature contracts require team agreement before implementation. This foundation intentionally contains no marketplace example classes.
