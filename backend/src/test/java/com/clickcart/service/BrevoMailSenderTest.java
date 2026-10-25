package com.clickcart.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class BrevoMailSenderTest {
    private final RestClient.Builder builder = RestClient.builder()
            .baseUrl("https://api.brevo.com").defaultHeader("api-key", "test-key");
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final BrevoMailSender sender = new BrevoMailSender(builder.build(), "sender@example.com");

    private SimpleMailMessage message() {
        var message = new SimpleMailMessage();
        message.setTo("customer@example.com");
        message.setSubject("Password reset");
        message.setText("Your code: 123456");
        return message;
    }

    @Test void sendsTextOverHttpsWithConfiguredSenderAndApiKey() {
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST)).andExpect(header("api-key", "test-key"))
                .andExpect(jsonPath("$.sender.email").value("sender@example.com"))
                .andExpect(jsonPath("$.to[0].email").value("customer@example.com"))
                .andExpect(jsonPath("$.subject").value("Password reset"))
                .andExpect(jsonPath("$.textContent").value("Your code: 123456"))
                .andRespond(withStatus(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                        .body("{\"messageId\":\"accepted\"}"));
        sender.send(message());
        server.verify();
    }

    @Test void failuresDoNotExposeProviderResponseOrSecrets() {
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("test-key 123456"));
        var error = assertThrows(MailSendException.class, () -> sender.send(message()));
        assertFalse(error.toString().contains("123456"));
        assertFalse(error.toString().contains("test-key"));
        assertNull(error.getCause());
        server.verify();
    }

    @Test void rejectsMissingRecipientWithoutSending() {
        var message = message();
        message.setTo(new String[0]);
        assertThrows(MailSendException.class, () -> sender.send(message));
        server.verify();
    }
}
