package com.clickcart.service;

import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.clickcart.model.User;

import jakarta.annotation.PreDestroy;

/**
 * Delivers password-reset codes by email (fix for QA BE-001: codes were only printed to the server console,
 * so testers could never obtain a genuine code).
 *
 * Uses the project's existing mail configuration (spring.mail.* in application.yml). Delivery mode is set with
 * AUTH_RESET_CODE_DELIVERY:
 *   auto    (default) email when a mail server is configured, otherwise the development console fallback
 *   email   always email; if no mail server is configured, the code is not delivered and an error is logged
 *   console always the development console fallback
 *
 * Emails are sent in the background so the forgot-password response time is the same for every address and
 * does not reveal whether an account exists. Failures are logged without the code.
 */
@Component
public class EmailPasswordResetCodeSender implements PasswordResetCodeSender {

    private static final Logger log = LoggerFactory.getLogger(EmailPasswordResetCodeSender.class);
    private static final Logger audit = LoggerFactory.getLogger("clickcart.audit.auth");

    static final String SUBJECT = "Your ClickCart password reset code";

    enum Mode { AUTO, EMAIL, CONSOLE }

    private final ObjectProvider<JavaMailSender> mailSender;
    private final PasswordResetCodeSender consoleFallback;
    private final Mode mode;
    private final String from;
    private final ExecutorService executor;

    @Autowired
    public EmailPasswordResetCodeSender(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${AUTH_RESET_CODE_DELIVERY:auto}") String mode,
            @Value("${AUTH_RESET_MAIL_FROM:${spring.mail.username:}}") String from) {
        this(mailSender, new ConsolePasswordResetCodeSender(), parseMode(mode), from,
                Executors.newSingleThreadExecutor(runnable -> {
                    Thread thread = new Thread(runnable, "reset-code-mailer");
                    thread.setDaemon(true);
                    return thread;
                }));
    }

    EmailPasswordResetCodeSender(ObjectProvider<JavaMailSender> mailSender, PasswordResetCodeSender consoleFallback,
                                 Mode mode, String from, ExecutorService executor) {
        this.mailSender = mailSender;
        this.consoleFallback = consoleFallback;
        this.mode = mode;
        this.from = from == null ? "" : from.trim();
        this.executor = executor;
        logDeliveryMode();
    }

    @Override
    public void send(User user, String code, Duration validFor) {
        JavaMailSender sender = mode == Mode.CONSOLE ? null : mailSender.getIfAvailable();

        if (sender == null) {
            if (mode == Mode.EMAIL) {
                log.error("AUTH_RESET_CODE_DELIVERY=email but no mail server is configured; "
                        + "reset code for userId={} was not delivered", user.getId());
                return;
            }
            consoleFallback.send(user, code, validFor);
            return;
        }

        executor.execute(() -> deliver(sender, user, code, validFor));
    }

    private void deliver(JavaMailSender sender, User user, String code, Duration validFor) {
        try {
            sender.send(buildMessage(user, code, validFor));
            audit.info("event=RESET_CODE_EMAILED userId={}", user.getId());
        } catch (RuntimeException ex) {
            // MailException (SMTP/auth/network) or anything unexpected. Never log the code; the user can request a new one.
            log.error("Could not email password reset code to userId={}: {}", user.getId(), ex.getMessage());
        }
    }

    SimpleMailMessage buildMessage(User user, String code, Duration validFor) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(from)) {
            message.setFrom("ClickCart <" + from + ">");
        }
        message.setTo(user.getEmail());
        message.setSubject(SUBJECT);

        String name = StringUtils.hasText(user.getFullName()) ? user.getFullName().trim() : "there";
        long minutes = validFor.toMinutes();
        message.setText("""
                Hi %s,

                Your ClickCart password reset code is:

                    %s

                It expires in %d minutes and can only be used once.

                If you didn't ask to reset your password, you can ignore this email. Your password won't change.
                Never share this code with anyone. ClickCart staff will never ask for it.

                The ClickCart team
                """.formatted(name, code, minutes));
        return message;
    }

    private void logDeliveryMode() {
        boolean mailConfigured = mailSender.getIfAvailable() != null;
        if (mode == Mode.CONSOLE || (mode == Mode.AUTO && !mailConfigured)) {
            log.warn("Password reset codes will be printed to the console (development only). "
                    + "Configure spring.mail.* to email them instead.");
        } else if (!mailConfigured) {
            log.error("AUTH_RESET_CODE_DELIVERY=email but no mail server is configured; reset codes cannot be delivered.");
        } else {
            log.info("Password reset codes will be emailed{}.", StringUtils.hasText(from) ? " from " + from : "");
        }
    }

    static Mode parseMode(String value) {
        try {
            return Mode.valueOf(value == null ? "AUTO" : value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            log.warn("Unknown AUTH_RESET_CODE_DELIVERY '{}'; using auto", value);
            return Mode.AUTO;
        }
    }

    @PreDestroy
    void shutdown() {
        executor.shutdown();
    }
}
