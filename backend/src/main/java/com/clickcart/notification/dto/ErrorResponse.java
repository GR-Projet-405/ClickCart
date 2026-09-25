package com.clickcart.notification.dto;

import java.util.List;

/**
 * Standardized error payload. Field names are camelCase per
 * docs/api-conventions.md. Pagination and correlation-id shapes are TBD by
 * the team (see docs/api-conventions.md).
 */
public record ErrorResponse(
        int status,
        String message,
        List<FieldError> errors
) {
    public ErrorResponse {
        errors = errors == null ? List.of() : List.copyOf(errors);
    }

    public record FieldError(String field, String message) {
    }
}