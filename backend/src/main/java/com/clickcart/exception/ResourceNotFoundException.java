package com.clickcart.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested resource does not exist in the data store.
 *
 * <p>Maps to HTTP {@code 404 Not Found}. The message should identify
 * the resource type and the ID that was looked up so that logs are useful
 * without exposing internal details to callers.</p>
 *
 * <p>Example usage:
 * <pre>{@code
 *   conversationRepository.findById(id)
 *       .orElseThrow(() -> new ResourceNotFoundException("Conversation", id));
 * }</pre></p>
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * @param resourceType human-readable name of the missing resource (e.g. "Conversation")
     * @param id           the identifier that was looked up
     */
    public ResourceNotFoundException(String resourceType, String id) {
        super(resourceType + " not found: " + id);
    }

    /**
     * Free-form variant for cases where the lookup key is not a simple ID.
     *
     * @param message descriptive message safe to return to the caller
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}