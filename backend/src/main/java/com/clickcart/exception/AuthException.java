package com.clickcart.exception;

import java.time.Instant;

import org.springframework.http.HttpStatus;

/**
 * Authentication failure with a machine-readable code the frontend can react to
 * (e.g. show remaining attempts or a lockout countdown). Mapped by {@link AuthExceptionHandler}.
 */
public class AuthException extends RuntimeException {

    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED";
    public static final String SESSION_EXPIRED = "SESSION_EXPIRED";

    private final HttpStatus status;
    private final String code;
    private final Integer attemptsRemaining;
    private final Instant lockedUntil;

    private AuthException(HttpStatus status, String code, String message,
                          Integer attemptsRemaining, Instant lockedUntil) {
        super(message);
        this.status = status;
        this.code = code;
        this.attemptsRemaining = attemptsRemaining;
        this.lockedUntil = lockedUntil;
    }

    /** @param attemptsRemaining shown to the user only when close to lockout; null otherwise */
    public static AuthException invalidCredentials(Integer attemptsRemaining) {
        return new AuthException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS,
                "Incorrect email or password", attemptsRemaining, null);
    }

    public static AuthException accountLocked(Instant lockedUntil) {
        return new AuthException(HttpStatus.LOCKED, ACCOUNT_LOCKED,
                "Too many failed attempts. Your account is temporarily locked.", null, lockedUntil);
    }

    public static AuthException accountSuspended() {
        return new AuthException(HttpStatus.FORBIDDEN, ACCOUNT_SUSPENDED,
                "This account has been suspended. Please contact support.", null, null);
    }

    public static AuthException sessionExpired() {
        return new AuthException(HttpStatus.UNAUTHORIZED, SESSION_EXPIRED,
                "Your session has expired. Please log in again.", null, null);
    }

    public HttpStatus getStatus() {
        return status;
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
}
