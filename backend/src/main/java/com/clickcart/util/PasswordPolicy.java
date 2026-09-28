package com.clickcart.util;

import java.nio.charset.StandardCharsets;

/**
 * Shared password rules (SRS SEC-002, TBD-07). The frontend mirrors these rules for live feedback;
 * the backend is authoritative.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;
    public static final int MAX_LENGTH = 64;
    /** BCrypt ignores input beyond 72 bytes, so longer passwords are rejected rather than silently truncated. */
    public static final int MAX_BYTES = 72;

    public static final String REQUIREMENTS_MESSAGE =
            "Password must be 8-64 characters and include an uppercase letter, a lowercase letter and a number";

    private PasswordPolicy() {
    }

    public static boolean isValid(String password) {
        if (password == null) {
            return false;
        }
        int length = password.length();
        if (length < MIN_LENGTH || length > MAX_LENGTH
                || password.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
            return false;
        }
        boolean upper = false;
        boolean lower = false;
        boolean digit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                upper = true;
            } else if (Character.isLowerCase(c)) {
                lower = true;
            } else if (Character.isDigit(c)) {
                digit = true;
            }
        }
        return upper && lower && digit;
    }
}
