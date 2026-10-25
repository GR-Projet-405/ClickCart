package com.clickcart.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.clickcart.model.User;

/**
 * DEVELOPMENT ONLY: prints the reset code to the backend console.
 * Used by {@link EmailPasswordResetCodeSender} as a fallback when no mail server is configured
 * (or AUTH_RESET_CODE_DELIVERY=console). Logging codes is not acceptable in production.
 */
public class ConsolePasswordResetCodeSender implements PasswordResetCodeSender {

    private static final Logger log = LoggerFactory.getLogger(ConsolePasswordResetCodeSender.class);

    @Override
    public void send(User user, String code, Duration validFor) {
        log.warn("[DEV ONLY] Password reset code for {}: {} (valid for {} minutes)",
                user.getEmail(), code, validFor.toMinutes());
    }
}
