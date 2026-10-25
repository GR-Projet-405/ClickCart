package com.clickcart.service;

import java.time.Duration;

import com.clickcart.model.User;

/**
 * Delivers a password-reset code to the user. The current implementation prints it to the backend console;
 * an email/SMS implementation (or the DEV-33 notification center) can replace it without changing the
 * reset flow.
 */
public interface PasswordResetCodeSender {

    void send(User user, String code, Duration validFor);
}
