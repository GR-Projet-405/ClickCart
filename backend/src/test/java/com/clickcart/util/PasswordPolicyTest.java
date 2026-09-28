package com.clickcart.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PasswordPolicyTest {

    @ParameterizedTest
    @ValueSource(strings = { "Secret123", "Abcdefg1", "Str0ng!Pass#2026" })
    void acceptsPasswordsMeetingAllRules(String password) {
        assertTrue(PasswordPolicy.isValid(password));
    }

    @ParameterizedTest
    @ValueSource(strings = { "Short1A", "alllowercase1", "ALLUPPERCASE1", "NoDigitsHere", "" })
    void rejectsPasswordsMissingARule(String password) {
        assertFalse(PasswordPolicy.isValid(password));
    }

    @Test
    void rejectsNullAndOverLongPasswords() {
        assertFalse(PasswordPolicy.isValid(null));
        assertFalse(PasswordPolicy.isValid("Aa1" + "x".repeat(62)));
    }

    @Test
    void rejectsPasswordsOverBcryptByteLimit() {
        // 30 characters but more than 72 UTF-8 bytes.
        assertFalse(PasswordPolicy.isValid("Aa1" + "ස".repeat(27)));
    }

    @Test
    void normalizesSriLankanMobileNumbers() {
        assertEquals("+94771234567", PhoneNumbers.normalizeSriLankaMobile("+94 77 123 4567"));
        assertEquals("+94771234567", PhoneNumbers.normalizeSriLankaMobile("077-123-4567"));
        assertEquals("+94771234567", PhoneNumbers.normalizeSriLankaMobile("771234567"));
        assertThrows(IllegalArgumentException.class, () -> PhoneNumbers.normalizeSriLankaMobile("0112345678"));
    }
}
