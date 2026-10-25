package com.clickcart.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an authenticated user attempts to access or modify a resource
 * they are not a participant of or authorised to change.
 *
 * <p>Maps to HTTP {@code 403 Forbidden}. The message must never reveal
 * implementation details — a generic "access denied" is sufficient for
 * the caller; full context is written to server logs by the service layer.</p>
 *
 * <p>Example usage:
 * <pre>{@code
 *   if (!isParticipant(conversation, currentUserId)) {
 *       throw new AccessForbiddenException("conversation", conversationId);
 *   }
 * }</pre></p>
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccessForbiddenException extends RuntimeException {

    /**
     * @param resourceType human-readable resource name (e.g. "conversation")
     * @param id           the resource identifier (included in the server-side message only)
     */
    public AccessForbiddenException(String resourceType, String id) {
        super("Access denied to " + resourceType + ": " + id);
    }

    /**
     * Free-form variant.
     *
     * @param message descriptive message (logged server-side; keep it concise)
     */
    public AccessForbiddenException(String message) {
        super(message);
    }
}
