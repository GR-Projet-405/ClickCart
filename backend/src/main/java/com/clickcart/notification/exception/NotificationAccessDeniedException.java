package com.clickcart.notification.exception;

/**
 * Thrown when a user attempts to access a notification they do not own.
 * Mapped to HTTP 403 by NotificationExceptionHandler (per SRS BR-09: users may
 * access only their own private marketplace data).
 */
public class NotificationAccessDeniedException extends RuntimeException {

    public NotificationAccessDeniedException(String message) {
        super(message);
    }

    public NotificationAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}