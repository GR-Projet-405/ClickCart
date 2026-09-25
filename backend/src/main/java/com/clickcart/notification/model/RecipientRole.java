package com.clickcart.notification.model;

/**
 * The role of the user who receives a notification.
 *
 * <p>This is intentionally a self-contained enum. It does not depend on any
 * Auth/User implementation that does not exist yet in the foundation; it is
 * paired with the opaque {@code recipientId} string on {@link Notification}.
 */
public enum RecipientRole {
    CUSTOMER,
    SERVICE_PROVIDER,
    PLATFORM_ADMIN
}