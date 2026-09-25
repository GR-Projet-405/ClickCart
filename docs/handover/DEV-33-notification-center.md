# DEV-33 Notification Center Handover

Status: COMPLETE (first draft). New-hire takeover.

## 1. Scope

In-app notification center (SRS SUP-004 to SUP-009) for Customer, Service
Provider, and Platform Admin users. This module owns the notification data
model, the publish contract other modules call, the REST API, the preferences
system, and the frontend pages.

## 2. MongoDB schemas

### `notifications`

| Field | Type | Notes |
|---|---|---|
| `id` | String (ObjectId) | @Id |
| `recipientId` | String | Opaque user identifier; indexed |
| `recipientRole` | enum {CUSTOMER, SERVICE_PROVIDER, PLATFORM_ADMIN} | |
| `eventType` | String | Matches event catalog name, e.g. `booking.status_changed` |
| `title` | String | |
| `message` | String | |
| `read` | boolean, default false | |
| `createdAt` | LocalDateTime | |
| `readAt` | LocalDateTime, nullable | |
| `metadata` | Map<String,Object> | Small structured context only |
| `updatedAt` | LocalDateTime | @LastModifiedDate |

Index: `(recipientId ASC, read ASC, createdAt DESC)` named
`recipientId_read_createdAt` (declared in
`com.clickcart.notification.config.NotificationIndexConfig`).

### `notification_preferences`

One document per user (unique index on `userId`).

| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `userId` | String | Unique index |
| `inAppEnabled` | boolean, default true | Always on — enforced at boundary |
| `emailEnabled` | boolean, default true | Optional channel |
| `smsEnabled` | boolean, default false | Optional channel (stub) |
| `whatsappEnabled` | boolean, default false | Optional channel (stub) |
| `pushEnabled` | boolean, default false | Optional channel (stub) |
| `disabledEventTypes` | List<String> | |
| `updatedAt` | LocalDateTime | |

## 3. Event name catalog

Full catalog: `docs/notification-events.md`.

Modules call the in-process hook (no HTTP, no broker required):

```java
notificationService.publish(new NotificationEvent(
    recipientId, recipientRole, eventType, title, message, metadata
));
```

`publish(...)` is defensive by contract (SRS SUP-009): invalid input and any
internal failure are caught and logged; it never throws upward, so it is safe
to call from other modules' business transactions.

## 4. REST API contract

Base path: `/api/notifications`. JSON camelCase, ISO-8601 dates.

| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | List current user's notifications. Query: `read` (true/false/omit), `page` (default 0), `size` (default 20). |
| GET | `/api/notifications/unread-count` | Returns `{ "unreadCount": long }`. |
| PATCH | `/api/notifications/{id}/read` | Mark one notification read (ownership checked). 404 if missing, 403 if wrong owner. |
| POST | `/api/notifications/read-all` | Mark all of the user's notifications read. Returns `{ "markedRead": int }`. |
| DELETE | `/api/notifications/{id}` | Delete one notification (ownership checked). |
| GET | `/api/notifications/preferences` | Returns preferences, creating defaults if missing. |
| PUT | `/api/notifications/preferences` | Updates preferences. Body: `UpdateNotificationPreferenceRequest`. |

### DTO shapes

- `NotificationResponse`: `{ id, recipientId, recipientRole, eventType, title, message, read, createdAt, readAt, metadata }`
- `NotificationPreferenceResponse`: `{ userId, inAppEnabled, emailEnabled, smsEnabled, whatsappEnabled, pushEnabled, disabledEventTypes }`
- `UpdateNotificationPreferenceRequest`: `{ inAppEnabled?, emailEnabled?, smsEnabled?, whatsappEnabled?, pushEnabled?, disabledEventTypes[] }`
- `ErrorResponse`: `{ status: int, message: string, errors?: [{ field, message }] }`

## 5. Read/unread and preferences behavior

- `read` defaults to false on creation; `readAt` is set when marked read.
- `markAsRead` / `delete` verify ownership (SRS BR-09): the notification must
  belong to the requesting `recipientId`, else 403.
- `getPreferences` creates a default `NotificationPreference` document if none
  exists.
- `updatePreferences` enforces `inAppEnabled = true` regardless of client input.
- Optional channels (email/SMS/WhatsApp/push) are toggled only when enabled by
  the user. Failure of an optional channel never blocks the core transaction
  (SUP-009) — the publish path catches and logs internally.

## 6. Temporary X-User-Id auth seam

DEV-33 TEMPORARY INTEGRATION POINT — replace before/with DEV-01.

- The current user id is read from the `X-User-Id` request header via
  `com.clickcart.notification.util.NotificationCurrentUserResolver` (interface
  + `HeaderResolver` default).
- A `NotificationAuthConfig` bean wires the resolver.
- Frontend `notificationService.js` sends `X-User-Id` from
  `localStorage.getItem("cc_user_id")`.
- To swap later, replace only the body of
  `NotificationCurrentUserResolver.currentUserId/currentRole` — the controller
  and service signatures stay unchanged.

## 7. Known limitations

- Pagination uses simple `page`/`size` params; project-wide pagination
  convention is TBD per `docs/api-conventions.md`. Reconcile once agreed.
- Optional external channels (SMS/WhatsApp/push) are stubbed (SUP-008); no
  real integration is built.
- No notification bell/badge in shared headers — that is a shared-component
  follow-up once team leadership approves.
- The event catalog in `docs/notification-events.md` is a first draft for team
  agreement (per `docs/api-conventions.md` and `docs/mongodb-guidelines.md` TBD
  notes).
- `message.received` deduplication policy is undecided (see open questions in
  `docs/notification-events.md`).

## 8. Next steps

1. Team agreement on the event catalog (`docs/notification-events.md`) before
   other modules call `publish(...)`.
2. DEV-01 auth lands → replace the `X-User-Id` seam with real
   `SecurityContextHolder`/`@AuthenticationPrincipal`.
3. Reconcile pagination convention with the team.
4. Implement optional external channels (email/SMS/WhatsApp/push) behind the
   existing preference toggles.
5. Add a notification bell/badge to shared headers (coordination required).
6. Wire BKG-015 and MSG-008 to call `publish(...)` with the agreed event names.
7. Add tests for the `delete` ownership path and preference update edge cases.