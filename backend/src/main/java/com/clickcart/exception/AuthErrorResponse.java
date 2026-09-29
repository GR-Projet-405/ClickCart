package com.clickcart.exception;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * The shared {@link ErrorResponse} plus optional auth fields. Extra fields are omitted when null,
 * so clients that only read the common fields are unaffected.
 */
public class AuthErrorResponse extends ErrorResponse {

    private final String code;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final Integer attemptsRemaining;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final Instant lockedUntil;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final Long retryAfterSeconds;

    public AuthErrorResponse(int status, String error, String message, String code,
                             Integer attemptsRemaining, Instant lockedUntil, Long retryAfterSeconds) {
        super(status, error, message);
        this.code = code;
        this.attemptsRemaining = attemptsRemaining;
        this.lockedUntil = lockedUntil;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public static AuthErrorResponse from(AuthException ex) {
        return new AuthErrorResponse(ex.getStatus().value(), ex.getStatus().getReasonPhrase(), ex.getMessage(),
                ex.getCode(), ex.getAttemptsRemaining(), ex.getLockedUntil(), null);
    }

    public static AuthErrorResponse rateLimited(long retryAfterSeconds) {
        return new AuthErrorResponse(429, "Too Many Requests",
                "Too many requests. Please wait a moment and try again.", "RATE_LIMITED",
                null, null, retryAfterSeconds);
    }

    public String getCode() {
        return code;
    }

    public Integer getAttemptsRemaining() {
        return attemptsRemaining;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public Long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
