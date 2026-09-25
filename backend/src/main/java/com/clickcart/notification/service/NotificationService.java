package com.clickcart.notification.service;

import com.clickcart.notification.dto.NotificationEvent;
import com.clickcart.notification.dto.NotificationPreferenceResponse;
import com.clickcart.notification.dto.UpdateNotificationPreferenceRequest;
import com.clickcart.notification.dto.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Public contract for the notification module.
 *
 * <p>The {@link #publish(NotificationEvent)} method is the in-process hook that
 * other modules (bookings BKG-015, messaging MSG-008, etc.) will call once the
 * event catalog in {@code docs/notification-events.md} is agreed. It is
 * defensive by contract: it MUST never throw an exception that could propagate
 * into and fail the caller's business transaction (SRS SUP-009).
 */
public interface NotificationService {

    /**
     * Create and deliver a notification. Safe to call from any service.
     *
     * <p>Guarantees:
     * <ul>
     *   <li>Invalid input is logged and ignored — never thrown.</li>
     *   <li>Any internal failure (repository error, etc.) is caught and logged —
     *       never propagated to the caller.</li>
     * </ul>
     */
    void publish(NotificationEvent event);

    /**
     * List a user's notifications. {@code read} filters by read state; when
     * {@code null} all notifications are returned.
     */
    Page<NotificationResponse> listForUser(String recipientId, Boolean read, Pageable pageable);

    /**
     * Count unread notifications for a user.
     */
    long getUnreadCount(String recipientId);

    /**
     * Mark a single notification as read. Throws
     * {@link com.clickcart.notification.exception.NotificationNotFoundException}
     * if it does not exist and
     * {@link com.clickcart.notification.exception.NotificationAccessDeniedException}
     * if it belongs to another user (SRS BR-09).
     */
    void markAsRead(String notificationId, String recipientId);

    /**
     * Mark all of a user's notifications as read.
     *
     * @return the number of notifications that were marked read.
     */
    int markAllAsRead(String recipientId);

    /**
     * Delete a single notification owned by the current user.
     *
     * <p>Throws {@link com.clickcart.notification.exception.NotificationNotFoundException}
     * if it does not exist and
     * {@link com.clickcart.notification.exception.NotificationAccessDeniedException}
     * if it belongs to another user (SRS BR-09).
     */
    void delete(String notificationId, String recipientId);

    /**
     * Get a user's preferences, creating a default document if none exists.
     */
    NotificationPreferenceResponse getPreferences(String userId);

    /**
     * Update a user's preferences. The in-app channel is always on.
     */
    NotificationPreferenceResponse updatePreferences(String userId, UpdateNotificationPreferenceRequest request);
}