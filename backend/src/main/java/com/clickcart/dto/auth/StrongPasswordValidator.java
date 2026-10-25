package com.clickcart.dto.auth;

import com.clickcart.util.PasswordPolicy;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Blank values are reported by @NotBlank; avoid a duplicate message.
        return value == null || value.isEmpty() || PasswordPolicy.isValid(value);
    }
}
