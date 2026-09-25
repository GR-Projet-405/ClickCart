package com.clickcart.notification.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Internal publish contract used by other modules (bookings, messaging, etc.)
 * to create a notification in-process. This is NOT exposed over HTTP — it is
 * the single entry point other developers call once the event catalog
 * (see docs/notification-events.md) is agreed.
 *
 * <p>Fields are validated at the API/service boundary before persistence.
 */
public record NotificationEvent(
        String recipientId,
        String recipientRole,
        String eventType,
        String title,
        String message,
        Map<String, Object> metadata
) {
    public NotificationEvent {
        recipientId = recipientId == null ? null : recipientId.trim();
        recipientRole = recipientRole == null ? null : recipientRole.trim();
        eventType = eventType == null ? null : eventType.trim();
        title = title == null ? null : title.trim();
        message = message == null ? null : message.trim();
    }
}