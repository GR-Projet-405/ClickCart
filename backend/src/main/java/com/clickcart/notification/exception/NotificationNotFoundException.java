package com.clickcart.notification.exception;

/**
 * Thrown when a notification cannot be located.
 * Mapped to HTTP 404 by NotificationExceptionHandler.
 */
public class NotificationNotFoundException extends RuntimeException {

    public NotificationNotFoundException(String message) {
        super(message);
    }

    public NotificationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}