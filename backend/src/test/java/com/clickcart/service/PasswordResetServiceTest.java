package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.clickcart.dto.auth.ForgotPasswordResponse;
import com.clickcart.dto.auth.PasswordResetResponse;
import com.clickcart.dto.auth.VerifyResetCodeResponse;
import com.clickcart.exception.AuthException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.PasswordResetCode;
import com.clickcart.model.RefreshToken;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-27T10:00:00Z");
    private static final String OLD_PASSWORD = "Secret123";

    @Mock
    private MongoTemplate mongo;

    @Mock
    private UserRepository users;

    @Mock
    private RefreshTokenService refreshTokens;

    @Mock
    private PasswordResetCodeSender codeSender;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);
    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        service = new PasswordResetService(mongo, users, passwordEncoder, refreshTokens, codeSender,
                Duration.ofMinutes(10), Duration.ofSeconds(60), 5, Duration.ofMinutes(10),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void unknownEmailGetsTheSameResponseAndNoCodeIsSent() {
        when(users.findByEmail("nobody@example.com")).thenReturn(Optional.empty());
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));

        ForgotPasswordResponse unknown = service.requestCode("nobody@example.com");
        ForgotPasswordResponse known = service.requestCode("Kamal@Example.com");

        assertEquals(known, unknown);
        assertEquals(600, known.codeExpiresInSeconds());
        verify(codeSender).send(any(User.class), anyString(), eq(Duration.ofMinutes(10)));
    }

    @Test
    void requestStoresOnlyASaltedHashOfASixDigitCode() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));

        service.requestCode("kamal@example.com");

        ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
        verify(codeSender).send(any(User.class), code.capture(), any(Duration.class));
        ArgumentCaptor<PasswordResetCode> stored = ArgumentCaptor.forClass(PasswordResetCode.class);
        verify(mongo).insert(stored.capture());

        assertTrue(code.getValue().matches("\\d{6}"));
        assertEquals(PasswordResetService.hashCode(stored.getValue().getCodeSalt(), code.getValue()),
                stored.getValue().getCodeHash());
        assertEquals(NOW.plus(Duration.ofMinutes(10)), stored.getValue().getCodeExpiresAt());
        // Any earlier open codes are invalidated.
        verify(mongo).updateMulti(any(Query.class), any(Update.class), eq(PasswordResetCode.class));
    }

    @Test
    void resendWithinCooldownDoesNotSendAnotherCode() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));
        PasswordResetCode recent = new PasswordResetCode();
        recent.setCreatedAt(NOW.minusSeconds(20));
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(recent);

        service.requestCode("kamal@example.com");

        verify(codeSender, never()).send(any(), anyString(), any());
        verify(mongo, never()).insert(any(PasswordResetCode.class));
    }

    @Test
    void suspendedAccountGetsNoCode() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.SUSPENDED)));

        service.requestCode("kamal@example.com");

        verify(codeSender, never()).send(any(), anyString(), any());
    }

    @Test
    void correctCodeReturnsResetToken() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));
        PasswordResetCode record = codeRecord("123456");
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(record);
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(PasswordResetCode.class))).thenReturn(record);

        VerifyResetCodeResponse response = service.verifyCode("kamal@example.com", "123456");

        assertTrue(response.resetToken().length() >= 40);
        assertEquals(600, response.expiresInSeconds());
    }

    @Test
    void wrongCodeCountsAnAttemptAndFails() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(codeRecord("123456"));

        AuthException ex = assertThrows(AuthException.class, () -> service.verifyCode("kamal@example.com", "654321"));

        assertEquals(AuthException.INVALID_RESET_CODE, ex.getCode());
        verify(mongo).updateFirst(any(Query.class), any(Update.class), eq(PasswordResetCode.class));
    }

    @Test
    void noActiveCodeFails() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(null);

        assertThrows(AuthException.class, () -> service.verifyCode("kamal@example.com", "123456"));
    }

    @Test
    void resetChangesPasswordClearsLockoutAndSignsOutEverywhere() {
        User user = user(AccountStatus.ACTIVE);
        user.setFailedLoginAttempts(4);
        user.setLockedUntil(NOW.plusSeconds(600));
        PasswordResetCode record = codeRecord("123456");
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(record);
        when(users.findById("u-1")).thenReturn(Optional.of(user));
        when(mongo.findAndModify(any(Query.class), any(Update.class), eq(PasswordResetCode.class))).thenReturn(record);

        PasswordResetResponse response = service.resetPassword("reset-token", "NewSecret456");

        assertEquals(NOW, response.changedAt());
        assertTrue(passwordEncoder.matches("NewSecret456", user.getPasswordHash()));
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
        assertEquals(1, user.getTokenVersion());
        verify(users).save(user);
        verify(refreshTokens).revokeAllForUser("u-1", RefreshToken.REASON_PASSWORD_RESET);
    }

    @Test
    void reusingTheCurrentPasswordIsRejectedWithoutConsumingTheToken() {
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(codeRecord("123456"));
        when(users.findById("u-1")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));

        AuthException ex = assertThrows(AuthException.class, () -> service.resetPassword("reset-token", OLD_PASSWORD));

        assertEquals(AuthException.PASSWORD_REUSED, ex.getCode());
        verify(mongo, never()).findAndModify(any(Query.class), any(Update.class), eq(PasswordResetCode.class));
        verify(users, never()).save(any());
    }

    @Test
    void expiredOrUsedResetTokenFails() {
        when(mongo.findOne(any(Query.class), eq(PasswordResetCode.class))).thenReturn(null);

        AuthException ex = assertThrows(AuthException.class, () -> service.resetPassword("old-token", "NewSecret456"));

        assertEquals(AuthException.RESET_SESSION_EXPIRED, ex.getCode());
        verify(refreshTokens, never()).revokeAllForUser(anyString(), anyString());
    }

    private PasswordResetCode codeRecord(String code) {
        PasswordResetCode record = new PasswordResetCode();
        record.setId("r-1");
        record.setUserId("u-1");
        record.setCodeSalt("salt");
        record.setCodeHash(PasswordResetService.hashCode("salt", code));
        record.setCodeExpiresAt(NOW.plusSeconds(300));
        record.setCreatedAt(NOW.minusSeconds(300));
        return record;
    }

    private User user(AccountStatus status) {
        User user = new User();
        user.setId("u-1");
        user.setEmail("kamal@example.com");
        user.setPasswordHash(passwordEncoder.encode(OLD_PASSWORD));
        user.setStatus(status);
        return user;
    }
}
