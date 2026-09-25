# Notification Event Catalog (SUP-007 / SRS §11.1)

> **Status: FIRST DRAFT — Team Agreement Required.**
>
> This document defines the standardized event-name catalog that other
> modules (bookings BKG-015, messaging MSG-008, payments, reviews, disputes,
> provider verification, etc.) will use to publish notifications through
> `NotificationService.publish(NotificationEvent)`.
>
> It is intentionally a draft matching the "TBD / Team Agreement Required" note
> already in `docs/api-conventions.md` and `docs/mongodb-guidelines.md`. Please
> review and agree before other modules start calling `publish(...)`.

## How to publish a notification

Other services call the in-process hook (no HTTP, no message broker required):

```java
notificationService.publish(new NotificationEvent(
    recipientId,        // opaque user identifier string
    recipientRole,      // "CUSTOMER" | "SERVICE_PROVIDER" | "PLATFORM_ADMIN"
    eventType,          // one of the names below
    title,              // rendered title
    message,            // rendered body
    metadata            // small structured context (Map<String,Object>)
));
```

- `publish(...)` is **defensive by contract**: it validates input and catches
  internal failures internally. It MUST never throw an exception that could
  propagate into and fail the caller's business transaction (SRS SUP-009).
- The in-app channel is always delivered. Optional external channels
  (email/SMS/WhatsApp/push) are honored only when the recipient's
  `NotificationPreference` has them enabled (SUP-006). Failure of an optional
  channel MUST never block the core transaction (SUP-009).

## Event name catalog

Each entry lists: event name, trigger module, expected metadata fields, and
default title/message template. Metadata values are small structured scalars
(strings/numbers/booleans) — never large payloads.

### Booking events (trigger: booking module, BKG-015)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `booking.created` | bookings | `bookingId`, `providerId`, `serviceTitle`, `scheduledAt` | "Booking confirmed" | "Your booking for {serviceTitle} has been confirmed." |
| `booking.status_changed` | bookings | `bookingId`, `previousStatus`, `newStatus`, `providerId` | "Booking status updated" | "Your booking {bookingId} status changed from {previousStatus} to {newStatus}." |
| `booking.cancelled` | bookings | `bookingId`, `cancelledBy`, `reason` | "Booking cancelled" | "Your booking {bookingId} has been cancelled." |

### Quote events (trigger: quote/booking module)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `quote.received` | bookings | `bookingId`, `providerId`, `quoteAmount` | "New quote received" | "A provider has submitted a quote of {quoteAmount} for your booking." |
| `quote.accepted` | bookings | `bookingId`, `providerId`, `quoteAmount` | "Quote accepted" | "Your quote of {quoteAmount} has been accepted by the provider." |

### Payment events (trigger: payments module)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `payment.received` | payments | `bookingId`, `paymentId`, `amount`, `currency` | "Payment received" | "Payment of {amount} {currency} received for booking {bookingId}." |
| `payment.refunded` | payments | `bookingId`, `paymentId`, `amount`, `currency` | "Payment refunded" | "Payment of {amount} {currency} has been refunded for booking {bookingId}." |

### Review events (trigger: reviews module, DEV-30)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `review.received` | reviews | `bookingId`, `providerId`, `reviewId`, `rating` | "New review received" | "You have received a {rating}-star review." |
| `review.response_received` | reviews | `bookingId`, `providerId`, `reviewId` | "Review response received" | "A provider has responded to your review." |

### Provider verification events (trigger: provider verification / admin module)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `provider.verification_approved` | provider-verification | `providerId`, `verificationId` | "Provider verified" | "Your provider profile has been verified and approved." |
| `provider.verification_rejected` | provider-verification | `providerId`, `verificationId`, `reason` | "Provider verification rejected" | "Your provider verification was rejected: {reason}." |

### Dispute events (trigger: disputes module)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `dispute.opened` | disputes | `bookingId`, `disputeId`, `openedBy` | "Dispute opened" | "A dispute has been opened for booking {bookingId}." |
| `dispute.resolved` | disputes | `bookingId`, `disputeId`, `resolution` | "Dispute resolved" | "Dispute {disputeId} has been resolved: {resolution}." |

### Messaging events (trigger: messaging module, MSG-008)

| Event name | Trigger module | Metadata fields | Default title | Default message |
|---|---|---|---|---|
| `message.received` | messaging | `conversationId`, `senderId`, `messageId` | "New message" | "You have received a new message." |

## Conventions for adding new event names

1. Names must be lowercase with dots separating segments: `<module>.<verb_past>` (e.g. `booking.status_changed`).
2. Each event must have a stable, unique name. Do not rename an existing event —
   add a new one and retire the old one in a coordinated release.
3. Every event must declare its expected metadata fields here before any
   module calls `publish(...)` with it.
4. The `recipientRole` must match the role of the intended recipient
   (`CUSTOMER`, `SERVICE_PROVIDER`, or `PLATFORM_ADMIN`).

## Open questions for team agreement

- Should `message.received` be deduplicated (one notification per unread
  message count) or one notification per message?
- Should `booking.status_changed` fire for every transition or only for a
  curated set (e.g. pending → confirmed → completed)?
- Should the catalog live in this file or be generated from an enum/shared
  contract class once the team agrees?