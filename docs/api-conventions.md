# REST API conventions

## Foundation

- All application API routes use the `/api` prefix.
- Requests and responses use JSON unless a future endpoint explicitly requires another representation.
- JSON field names use `camelCase`.
- Date and time values use ISO-8601 formats.
- Routes should describe nouns and resources rather than action-heavy commands.

Use standard HTTP verbs:

- `GET` — retrieve a representation
- `POST` — create or initiate processing
- `PUT` — replace a complete representation
- `PATCH` — partially update a representation
- `DELETE` — remove a resource

## Response behavior

- `2xx` — successful request
- `400` — invalid request or validation error
- `401` — unauthenticated request
- `403` — authenticated but unauthorized request
- `404` — resource not found
- `409` — state conflict
- `500` — unexpected server failure

Validation errors should eventually use one consistent, machine-readable structure. Stack traces and internal implementation details must never be exposed to clients.

Pagination field names, error payload schemas, request correlation identifiers, and versioning strategy are **TBD / Team Agreement Required**.
