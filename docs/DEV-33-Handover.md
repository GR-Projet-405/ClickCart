# DEV-33: Notification Center

1. Module overview

DEV-33 stores in-app notification records and notification preferences for the signed-in user. Each record is owned by one recipient. A preference that is turned off stops new records of that type from being stored. A missing preference means the type stays on.

The page is the Notification Center. The provider, admin, and customer bells open the same page inside each role's existing layout.

2. Frontend

- Page: `frontend/src/pages/Provider/NotificationsPage.jsx`
- Styles: `frontend/src/pages/Provider/NotificationsPage.css`
- API client: `frontend/src/services/notificationService.js`
- Routes, all rendering `NotificationsPage`:
  - `/provider/notifications` inside `ServiceProviderLayout`
  - `/admin/notifications` inside `AdminLayout`
  - `/notifications` inside `CustomerLayout`

The page loads preference groups and the unread count. Disable All turns the visible toggles off locally. Save Preferences sends the map to the API. The unread line uses the count returned for the signed-in user.

3. Collections

`notifications`

- `recipientUserId`, `recipientRole`
- `type`, `title`, `body`
- `read` (default false), `readAt`, `createdAt`
- `sourceType`, `sourceId`
- Indexes: `idx_notifications_recipient_created` (`recipientUserId`, `createdAt` descending), `idx_notifications_recipient_read` (`recipientUserId`, `read`)

`notification_preferences`

- One document per user
- `userId` (unique index `uk_notification_preferences_user`)
- `enabled`: map of `NotificationType` name to boolean
- `updatedAt`

Indexes are created at startup by `NotificationIndexInitializer`.

4. Endpoints

All routes require an authenticated user. The user id comes from the JWT principal, not from the request body. Responses use `ApiResponse` and the payload is in `data`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/notifications` | That user's records, newest first |
| GET | `/api/notifications/unread-count` | `{ "count": n }` |
| PATCH | `/api/notifications/{id}/read` | Marks one record read when it belongs to that user. Another user's id returns 404 |
| GET | `/api/notification-preferences` | Groups allowed for the current role, with saved on/off values |
| PUT | `/api/notification-preferences` | Body `{ "enabled": { "TYPE": true } }`. A type outside the role is rejected. A type omitted from the body stays on |

5. Types each role can see

Provider: `NEW_BOOKING_REQUEST`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `UPCOMING_BOOKING_REMINDER`, `PAYMENT_RECEIVED`, `COMMISSION_DEDUCTED`, `REFUND_ISSUED`, `NEW_MESSAGE`, `NEW_REVIEW_POSTED`, `REVIEW_MODERATION_ALERT`, `PROFILE_VERIFICATION_UPDATES`, `PLATFORM_ANNOUNCEMENTS`.

Customer: `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `UPCOMING_BOOKING_REMINDER`, `REFUND_ISSUED`, `NEW_MESSAGE`, `PLATFORM_ANNOUNCEMENTS`.

Platform admin: `REVIEW_MODERATION_ALERT`, `PROFILE_VERIFICATION_UPDATES`, `PLATFORM_ANNOUNCEMENTS`.

The titles and descriptions live in `NotificationCatalog`.

6. Integration hook

Other features call:

```java
notificationService.publish(
    recipientUserId,
    role,
    type,
    title,
    body,
    sourceType,
    sourceId);
```

`publish` stores nothing when the recipient id is blank, the role cannot receive that type, or the recipient has that type turned off. It returns `Optional.empty()` in those cases and the saved `Notification` otherwise.

Connected now:

| Feature | Method | Type | Recipient |
|---|---|---|---|
| Messaging | `MessageService.sendMessage` | `NEW_MESSAGE` | The other participant. Source type `CONVERSATION`, source id is the conversation id |

Still to connect. Do not publish from the notification module itself. Each owner calls `publish` at the end of the existing method.

| Feature | Method | Type | Recipient |
|---|---|---|---|
| Booking creation | `BookingService.createBooking` | `NEW_BOOKING_REQUEST` | Provider |
| Booking decision | `BookingService.decide` when the next status is confirmed | `BOOKING_CONFIRMED` | Customer and provider |
| Booking decision or cancel | `BookingService.decide` or `BookingService.cancelBooking` | `BOOKING_CANCELLED` | The other party, and the person who cancelled when both should be told |
| Booking reminder | No scheduler exists yet | `UPCOMING_BOOKING_REMINDER` | Customer and provider, about one hour before the booking |
| Payment | `PaymentService.processPayment` or `handleWebhook` when payment succeeds | `PAYMENT_RECEIVED` | Provider |
| Commission | `CommissionTransactionService.create` | `COMMISSION_DEDUCTED` | Provider |
| Refund | `RefundService.updateStatus` when the refund is issued | `REFUND_ISSUED` | Customer |
| Reviews | `ReviewService.createVerifiedReview` | `NEW_REVIEW_POSTED` | Provider |
| Review report | `ReviewService.reportReview` | `REVIEW_MODERATION_ALERT` | Each `PLATFORM_ADMIN` user |
| Verification | `ProviderVerificationService.updateProviderStatus` and `rejectProvider` | `PROFILE_VERIFICATION_UPDATES` | That provider's user id |
| Announcements | No announcement writer exists yet | `PLATFORM_ANNOUNCEMENTS` | The users selected by the admin feature |

Use the booking id, payment id, refund id, review id, or provider id as `sourceId`. Set `sourceType` to `BOOKING`, `PAYMENT`, `REFUND`, `REVIEW`, `PROVIDER`, or `ANNOUNCEMENT`.
