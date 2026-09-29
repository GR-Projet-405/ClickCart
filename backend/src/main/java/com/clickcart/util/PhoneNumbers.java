package com.clickcart.util;

/**
 * Sri Lankan mobile number helpers. Accepts "+94 77 123 4567", "0771234567" or "771234567".
 */
public final class PhoneNumbers {

    /** Used by request DTOs; spaces and hyphens are allowed between digits. */
    public static final String SRI_LANKA_MOBILE_REGEX = "^(?:\\+94|0)?[\\s-]*7(?:[\\s-]*\\d){8}$";

    private PhoneNumbers() {
    }

    /** Returns the number in E.164 form, e.g. +94771234567. */
    public static String normalizeSriLankaMobile(String raw) {
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.startsWith("94")) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (!digits.matches("7\\d{8}")) {
            throw new IllegalArgumentException("Enter a valid Sri Lankan mobile number");
        }
        return "+94" + digits;
    }
}
