package com.clickcart.service;

import java.util.Arrays;
import java.util.Map;
import jakarta.mail.internet.MimeMessage;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.client.RestClient;

/** Sends the application's plain-text emails through Brevo's HTTPS API. */
public class BrevoMailSender extends JavaMailSenderImpl {
    private final RestClient client;
    private final String from;

    public BrevoMailSender(RestClient client, String from) {
        this.client = client;
        this.from = from;
    }

    @Override
    public void send(SimpleMailMessage message) {
        send(new SimpleMailMessage[] { message });
    }

    @Override
    public void send(SimpleMailMessage... messages) {
        for (SimpleMailMessage message : messages) {
            if (message.getTo() == null || message.getTo().length == 0
                    || message.getSubject() == null || message.getText() == null) {
                throw new MailSendException("Email recipient, subject and body are required");
            }
            var payload = Map.of(
                    "sender", Map.of("name", "ClickCart", "email", from),
                    "to", Arrays.stream(message.getTo()).map(email -> Map.of("email", email)).toList(),
                    "subject", message.getSubject(), "textContent", message.getText());
            try {
                client.post().uri("/v3/smtp/email").contentType(MediaType.APPLICATION_JSON)
                        .body(payload).retrieve().toBodilessEntity();
            } catch (RuntimeException ex) {
                // Provider responses may contain private message content. Do not propagate them to logs.
                throw new MailSendException("Brevo email delivery failed; check the provider dashboard");
            }
        }
    }

    @Override
    protected void doSend(MimeMessage[] messages, Object[] originalMessages) {
        throw new MailSendException("MIME email is not supported by the Brevo transport");
    }
}
