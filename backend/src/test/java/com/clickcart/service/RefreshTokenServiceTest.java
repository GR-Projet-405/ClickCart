package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

import com.clickcart.exception.AuthException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.RefreshToken;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.service.RefreshTokenService.IssuedRefreshToken;
import com.clickcart.service.RefreshTokenService.Rotation;
import com.clickcart.util.SecureTokens;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-27T10:00:00Z");

    @Mock
    private MongoTemplate mongo;

    @Mock
    private UserRepository users;

    private RefreshTokenService service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(mongo, users, Duration.ofHours(24), Duration.ofDays(30),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void issueStoresOnlyTheHashAndUsesRememberMeLifetime() {
        IssuedRefreshToken session = service.issue("u-1", false);
        IssuedRefreshToken remembered = service.issue("u-1", true);

        ArgumentCaptor<RefreshToken> stored = ArgumentCaptor.forClass(RefreshToken.class);
        verify(mongo, org.mockito.Mockito.times(2)).insert(stored.capture());
        RefreshToken first = stored.getAllValues().get(0);

        assertEquals(SecureTokens.sha256Hex(session.rawToken()), first.getTokenHash());
        assertNotEquals(session.rawToken(), first.getTokenHash());
        assertEquals(NOW.plus(Duration.ofHours(24)), session.expiresAt());
        assertEquals(NOW.plus(Duration.ofDays(30)), remembered.expiresAt());
    }

    @Test
    void rotateIssuesNewTokenWithSameAbsoluteExpiry() {
        RefreshToken current = token("u-1", NOW.plus(Duration.ofDays(3)), null, null);
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(current);
        when(users.findById("u-1")).thenReturn(Optional.of(user(AccountStatus.ACTIVE)));

        Rotation rotation = service.rotate("old-raw");

        assertEquals("u-1", rotation.user().getId());
        assertEquals(current.getExpiresAt(), rotation.refreshToken().expiresAt());
        assertNotEquals("old-raw", rotation.refreshToken().rawToken());
    }

    @Test
    void reusingATokenRotatedLongAgoRevokesAllSessions() {
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(null);
        when(mongo.findOne(any(Query.class), eq(RefreshToken.class))).thenReturn(
                token("u-1", NOW.plus(Duration.ofDays(1)), NOW.minus(Duration.ofMinutes(5)), RefreshToken.REASON_ROTATED));

        AuthException ex = assertThrows(AuthException.class, () -> service.rotate("stolen-raw"));

        assertEquals(AuthException.SESSION_EXPIRED, ex.getCode());
        verify(mongo).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void concurrentRefreshWithinGraceWindowDoesNotRevokeEverything() {
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(null);
        when(mongo.findOne(any(Query.class), eq(RefreshToken.class))).thenReturn(
                token("u-1", NOW.plus(Duration.ofDays(1)), NOW.minus(Duration.ofSeconds(5)), RefreshToken.REASON_ROTATED));

        assertThrows(AuthException.class, () -> service.rotate("just-rotated-raw"));

        verify(mongo, never()).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void expiredTokenIsRejected() {
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(token("u-1", NOW.minus(Duration.ofSeconds(1)), null, null));

        assertThrows(AuthException.class, () -> service.rotate("expired-raw"));
        verify(mongo, never()).insert(any(RefreshToken.class));
    }

    @Test
    void suspendedUserCannotRefresh() {
        when(mongo.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(token("u-1", NOW.plus(Duration.ofDays(1)), null, null));
        when(users.findById("u-1")).thenReturn(Optional.of(user(AccountStatus.SUSPENDED)));

        AuthException ex = assertThrows(AuthException.class, () -> service.rotate("raw"));

        assertEquals(AuthException.ACCOUNT_SUSPENDED, ex.getCode());
        verify(mongo).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void missingCookieIsSessionExpired() {
        AuthException ex = assertThrows(AuthException.class, () -> service.rotate(null));
        assertTrue(ex.getMessage().contains("session"));
    }

    private static RefreshToken token(String userId, Instant expiresAt, Instant revokedAt, String reason) {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setExpiresAt(expiresAt);
        token.setRevokedAt(revokedAt);
        token.setRevokedReason(reason);
        return token;
    }

    private static User user(AccountStatus status) {
        User user = new User();
        user.setId("u-1");
        user.setStatus(status);
        return user;
    }
}
