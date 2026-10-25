package com.clickcart.service;

import java.util.List;

import com.clickcart.model.NotificationType;
import com.clickcart.model.Role;

/**
 * Preference groups each role is allowed to see and save.
 */
public final class NotificationCatalog {

    public record Item(NotificationType type, String title, String description) {
    }

    public record Group(String key, String label, List<Item> items) {
    }

    private static final Item NEW_BOOKING_REQUEST = item(
            NotificationType.NEW_BOOKING_REQUEST,
            "New Booking Request",
            "When a customer submits a new booking request");
    private static final Item BOOKING_CONFIRMED = item(
            NotificationType.BOOKING_CONFIRMED,
            "Booking Confirmed",
            "When a booking is confirmed by either party");
    private static final Item BOOKING_CANCELLED = item(
            NotificationType.BOOKING_CANCELLED,
            "Booking Cancelled",
            "When a booking is cancelled by either party");
    private static final Item UPCOMING_BOOKING_REMINDER = item(
            NotificationType.UPCOMING_BOOKING_REMINDER,
            "Upcoming Booking Reminder",
            "Reminder 1 hour before a scheduled booking");
    private static final Item PAYMENT_RECEIVED = item(
            NotificationType.PAYMENT_RECEIVED,
            "Payment Received",
            "When a payment is credited to your wallet");
    private static final Item COMMISSION_DEDUCTED = item(
            NotificationType.COMMISSION_DEDUCTED,
            "Commission Deducted",
            "When a platform commission is applied");
    private static final Item REFUND_ISSUED = item(
            NotificationType.REFUND_ISSUED,
            "Refund Issued",
            "When a refund is processed for a booking");
    private static final Item NEW_MESSAGE = item(
            NotificationType.NEW_MESSAGE,
            "New Message",
            "When you receive a message from a customer or provider");
    private static final Item NEW_REVIEW_POSTED = item(
            NotificationType.NEW_REVIEW_POSTED,
            "New Review Posted",
            "When a customer leaves a review on your service");
    private static final Item REVIEW_MODERATION_ALERT = item(
            NotificationType.REVIEW_MODERATION_ALERT,
            "Review Moderation Alert",
            "When a review is flagged for moderation");
    private static final Item PROFILE_VERIFICATION_UPDATES = item(
            NotificationType.PROFILE_VERIFICATION_UPDATES,
            "Profile Verification Updates",
            "Updates on your provider verification status");
    private static final Item PLATFORM_ANNOUNCEMENTS = item(
            NotificationType.PLATFORM_ANNOUNCEMENTS,
            "Platform Announcements",
            "New categories, policy updates and marketplace news");

    private NotificationCatalog() {
    }

    public static List<Group> groupsFor(Role role) {
        if (role == Role.PLATFORM_ADMIN) {
            return List.of(
                    group("REVIEW", "Review notifications", REVIEW_MODERATION_ALERT),
                    group("SYSTEM", "System notifications", PROFILE_VERIFICATION_UPDATES, PLATFORM_ANNOUNCEMENTS));
        }
        if (role == Role.CUSTOMER) {
            return List.of(
                    group("BOOKING", "Booking notifications", BOOKING_CONFIRMED, BOOKING_CANCELLED,
                            UPCOMING_BOOKING_REMINDER),
                    group("PAYMENT", "Payment notifications", REFUND_ISSUED),
                    group("MESSAGE", "Message notifications", NEW_MESSAGE),
                    group("SYSTEM", "System notifications", PLATFORM_ANNOUNCEMENTS));
        }
        return List.of(
                group("BOOKING", "Booking notifications", NEW_BOOKING_REQUEST, BOOKING_CONFIRMED, BOOKING_CANCELLED,
                        UPCOMING_BOOKING_REMINDER),
                group("PAYMENT", "Payment notifications", PAYMENT_RECEIVED, COMMISSION_DEDUCTED, REFUND_ISSUED),
                group("MESSAGE", "Message notifications", NEW_MESSAGE),
                group("REVIEW", "Review notifications", NEW_REVIEW_POSTED, REVIEW_MODERATION_ALERT),
                group("SYSTEM", "System notifications", PROFILE_VERIFICATION_UPDATES, PLATFORM_ANNOUNCEMENTS));
    }

    public static boolean allows(Role role, NotificationType type) {
        return groupsFor(role).stream()
                .flatMap(group -> group.items().stream())
                .anyMatch(item -> item.type() == type);
    }

    private static Item item(NotificationType type, String title, String description) {
        return new Item(type, title, description);
    }

    private static Group group(String key, String label, Item... items) {
        return new Group(key, label, List.of(items));
    }
}
