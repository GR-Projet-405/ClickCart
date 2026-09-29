package com.clickcart.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.clickcart.model.User;

/**
 * DEVELOPMENT ONLY: prints the reset code to the backend console because no email service exists yet.
 * Replace with a real email/SMS sender before production; logging codes is not acceptable there.
 */
@Component
public class ConsolePasswordResetCodeSender implements PasswordResetCodeSender {

    private static final Logger log = LoggerFactory.getLogger(ConsolePasswordResetCodeSender.class);

    @Override
    public void send(User user, String code, Duration validFor) {
        log.warn("[DEV ONLY] Password reset code for {}: {} (valid for {} minutes)",
                user.getEmail(), code, validFor.toMinutes());
    }
}
