package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.concurrent.AbstractExecutorService;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.clickcart.model.User;
import com.clickcart.service.EmailPasswordResetCodeSender.Mode;

class EmailPasswordResetCodeSenderTest {

    private static final Duration TEN_MINUTES = Duration.ofMinutes(10);

    private JavaMailSender mailSender;
    private PasswordResetCodeSender console;
    private User user;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        console = mock(PasswordResetCodeSender.class);
        user = new User();
        user.setId("u-1");
        user.setEmail("kamal@example.com");
        user.setFullName("Kamal Perera");
    }

    @Test
    void autoModeEmailsTheCodeWhenMailIsConfigured() {
        sender(Mode.AUTO, mailSender, "clickcart.noreply@example.com").send(user, "482190", TEN_MINUTES);

        ArgumentCaptor<SimpleMailMessage> sent = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(sent.capture());
        SimpleMailMessage message = sent.getValue();
        assertArrayEquals(new String[] { "kamal@example.com" }, message.getTo());
        assertEquals("ClickCart <clickcart.noreply@example.com>", message.getFrom());
        assertEquals(EmailPasswordResetCodeSender.SUBJECT, message.getSubject());
        assertTrue(message.getText().contains("482190"));
        assertTrue(message.getText().contains("Hi Kamal Perera"));
        assertTrue(message.getText().contains("10 minutes"));
        verify(console, never()).send(any(), any(), any());
    }

    @Test
    void autoModeFallsBackToConsoleWithoutMailServer() {
        sender(Mode.AUTO, null, "").send(user, "482190", TEN_MINUTES);

        verify(console).send(user, "482190", TEN_MINUTES);
    }

    @Test
    void consoleModeNeverEmails() {
        sender(Mode.CONSOLE, mailSender, "clickcart.noreply@example.com").send(user, "482190", TEN_MINUTES);

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
        verify(console).send(user, "482190", TEN_MINUTES);
    }

    @Test
    void emailModeWithoutMailServerDoesNotLeakCodeToConsole() {
        sender(Mode.EMAIL, null, "").send(user, "482190", TEN_MINUTES);

        verify(console, never()).send(any(), any(), any());
    }

    @Test
    void smtpFailureIsLoggedNotThrown() {
        doThrow(new MailSendException("535 Authentication failed")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> sender(Mode.AUTO, mailSender, "").send(user, "482190", TEN_MINUTES));
    }

    @Test
    void missingFromAddressLeavesFromUnset() {
        SimpleMailMessage message = sender(Mode.AUTO, mailSender, "  ").buildMessage(user, "482190", TEN_MINUTES);

        assertEquals(null, message.getFrom());
    }

    @Test
    void unknownModeFallsBackToAuto() {
        assertEquals(Mode.AUTO, EmailPasswordResetCodeSender.parseMode("sms"));
        assertEquals(Mode.EMAIL, EmailPasswordResetCodeSender.parseMode(" Email "));
        assertEquals(Mode.AUTO, EmailPasswordResetCodeSender.parseMode(null));
    }

    private EmailPasswordResetCodeSender sender(Mode mode, JavaMailSender available, String from) {
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(available);
        return new EmailPasswordResetCodeSender(provider, console, mode, from, new DirectExecutorService());
    }

    /** Runs tasks immediately on the calling thread so tests can verify the email synchronously. */
    private static final class DirectExecutorService extends AbstractExecutorService {
        private boolean shutdown;

        @Override
        public void execute(Runnable command) {
            command.run();
        }

        @Override
        public void shutdown() {
            shutdown = true;
        }

        @Override
        public List<Runnable> shutdownNow() {
            shutdown = true;
            return List.of();
        }

        @Override
        public boolean isShutdown() {
            return shutdown;
        }

        @Override
        public boolean isTerminated() {
            return shutdown;
        }

        @Override
        public boolean awaitTermination(long timeout, TimeUnit unit) {
            return true;
        }
    }
}
