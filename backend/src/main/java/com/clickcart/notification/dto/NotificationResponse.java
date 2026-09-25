package com.clickcart.notification.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * API response payload for a single notification. Deliberately flat and
 * camelCase per docs/api-conventions.md — model classes are never exposed.
 */
public record NotificationResponse(
        String id,
        String recipientId,
        String recipientRole,
        String eventType,
        String title,
        String message,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime readAt,
        Map<String, Object> metadata
) {
}