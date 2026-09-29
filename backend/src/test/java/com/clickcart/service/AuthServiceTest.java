package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.clickcart.dto.auth.LoginRequest;
import com.clickcart.dto.auth.RegisterRequest;
import com.clickcart.exception.AuthException;
import com.clickcart.exception.DuplicateResourceException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.service.AuthService.AuthSession;
import com.clickcart.service.LoginAttemptService.FailureOutcome;
import com.clickcart.service.RefreshTokenService.IssuedRefreshToken;
import com.clickcart.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSWORD = "Secret123";

    @Mock
    private UserRepository users;

    @Mock
    private RefreshTokenService refreshTokens;

    @Mock
    private LoginAttemptService loginAttempts;

    // Low cost factor keeps the tests fast; production uses 12.
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);
    private final JwtUtil jwtUtil = new JwtUtil("test-secret-that-is-long-enough-for-hs256-signing", 15);

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, passwordEncoder, jwtUtil, refreshTokens, loginAttempts);
        lenient().when(refreshTokens.issue(anyString(), anyBoolean())).thenAnswer(inv ->
                new IssuedRefreshToken("raw-refresh", Instant.now().plus(1, ChronoUnit.DAYS), inv.getArgument(1)));
    }

    @Test
    void registerCustomerHashesPasswordNormalizesInputAndStartsSession() {
        when(users.existsByEmail("kamal@example.com")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(inv -> withId(inv.getArgument(0), "u-1"));

        AuthSession session = service.register(customerRequest("  Kamal@Example.com ", ProviderType.BUSINESS));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        User user = saved.getValue();
        assertEquals("kamal@example.com", user.getEmail());
        assertEquals("Kamal Perera", user.getFullName());
        assertEquals("+94771234567", user.getPhone());
        assertEquals(Role.CUSTOMER, user.getRole());
        assertNull(user.getProviderType(), "customers never get a provider type");
        assertNotEquals(PASSWORD, user.getPasswordHash());
        assertTrue(passwordEncoder.matches(PASSWORD, user.getPasswordHash()));

        assertEquals("Bearer", session.response().tokenType());
        assertEquals("u-1", jwtUtil.parseAccessToken(session.response().accessToken()).orElseThrow().id());
        verify(refreshTokens).issue("u-1", false);
    }

    @Test
    void registerProviderKeepsProviderType() {
        when(users.save(any(User.class))).thenAnswer(inv -> withId(inv.getArgument(0), "p-1"));

        AuthSession session = service.register(new RegisterRequest(Role.SERVICE_PROVIDER, ProviderType.INDIVIDUAL,
                "Kamal Perera", "0771234567", "kamal@example.com", PASSWORD, true));

        assertEquals(ProviderType.INDIVIDUAL, session.response().user().providerType());
        assertEquals(Role.SERVICE_PROVIDER,
                jwtUtil.parseAccessToken(session.response().accessToken()).orElseThrow().role());
    }

    @Test
    void registerProviderWithoutProviderTypeIsRejected() {
        RegisterRequest request = new RegisterRequest(Role.SERVICE_PROVIDER, null,
                "Kamal Perera", "0771234567", "kamal@example.com", PASSWORD, true);

        assertThrows(IllegalArgumentException.class, () -> service.register(request));
        verify(users, never()).save(any());
    }

    @Test
    void registerAsAdminIsRejected() {
        RegisterRequest request = new RegisterRequest(Role.PLATFORM_ADMIN, null,
                "Kamal Perera", "0771234567", "kamal@example.com", PASSWORD, true);

        assertThrows(IllegalArgumentException.class, () -> service.register(request));
        verify(users, never()).save(any());
    }

    @Test
    void registerWithExistingEmailIsConflict() {
        when(users.existsByEmail("kamal@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> service.register(customerRequest("kamal@example.com", null)));
        verify(users, never()).save(any());
    }

    @Test
    void registerRaceOnUniqueIndexIsConflict() {
        when(users.save(any(User.class))).thenThrow(new DuplicateKeyException("E11000"));

        assertThrows(DuplicateResourceException.class,
                () -> service.register(customerRequest("kamal@example.com", null)));
    }

    @Test
    void loginWithCorrectPasswordResetsCounterAndHonoursRememberMe() {
        User user = existingUser(AccountStatus.ACTIVE);
        user.setFailedLoginAttempts(3);
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user));

        AuthSession session = service.login(new LoginRequest("KAMAL@example.com", PASSWORD, true));

        assertEquals("u-1", session.response().user().id());
        assertEquals(0, user.getFailedLoginAttempts());
        assertTrue(session.refreshToken().rememberMe());
        verify(refreshTokens).issue("u-1", true);
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameMessage() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.ACTIVE)));
        when(users.findByEmail("nobody@example.com")).thenReturn(Optional.empty());
        when(loginAttempts.recordFailure("u-1")).thenReturn(new FailureOutcome(4, null));

        AuthException wrongPassword = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("kamal@example.com", "Wrong123", false)));
        AuthException unknownEmail = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("nobody@example.com", PASSWORD, false)));

        assertEquals(wrongPassword.getMessage(), unknownEmail.getMessage());
        assertEquals(AuthException.INVALID_CREDENTIALS, wrongPassword.getCode());
        assertNull(wrongPassword.getAttemptsRemaining(), "remaining attempts hidden while far from lockout");
        assertNull(unknownEmail.getAttemptsRemaining());
    }

    @Test
    void remainingAttemptsShownWhenCloseToLockout() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.ACTIVE)));
        when(loginAttempts.recordFailure("u-1")).thenReturn(new FailureOutcome(2, null));

        AuthException ex = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("kamal@example.com", "Wrong123", false)));

        assertEquals(2, ex.getAttemptsRemaining());
    }

    @Test
    void fifthWrongPasswordLocksTheAccount() {
        Instant until = Instant.now().plus(15, ChronoUnit.MINUTES);
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.ACTIVE)));
        when(loginAttempts.recordFailure("u-1")).thenReturn(new FailureOutcome(0, until));

        AuthException ex = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("kamal@example.com", "Wrong123", false)));

        assertEquals(AuthException.ACCOUNT_LOCKED, ex.getCode());
        assertEquals(until, ex.getLockedUntil());
    }

    @Test
    void lockedAccountRejectsEvenTheCorrectPassword() {
        User user = existingUser(AccountStatus.ACTIVE);
        user.setLockedUntil(Instant.now().plus(10, ChronoUnit.MINUTES));
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user));

        AuthException ex = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("kamal@example.com", PASSWORD, false)));

        assertEquals(AuthException.ACCOUNT_LOCKED, ex.getCode());
        verify(loginAttempts, never()).recordFailure(any());
        verify(refreshTokens, never()).issue(anyString(), anyBoolean());
    }

    @Test
    void expiredLockAllowsLoginAgain() {
        User user = existingUser(AccountStatus.ACTIVE);
        user.setLockedUntil(Instant.now().minus(1, ChronoUnit.MINUTES));
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user));

        service.login(new LoginRequest("kamal@example.com", PASSWORD, false));

        assertNull(user.getLockedUntil());
    }

    @Test
    void suspendedAccountCannotLogIn() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.SUSPENDED)));

        AuthException ex = assertThrows(AuthException.class,
                () -> service.login(new LoginRequest("kamal@example.com", PASSWORD, false)));

        assertEquals(AuthException.ACCOUNT_SUSPENDED, ex.getCode());
        verify(refreshTokens, never()).issue(anyString(), anyBoolean());
    }

    @Test
    void refreshReturnsNewAccessTokenForRotatedSession() {
        User user = existingUser(AccountStatus.ACTIVE);
        IssuedRefreshToken next = new IssuedRefreshToken("next", Instant.now().plus(1, ChronoUnit.DAYS), false);
        when(refreshTokens.rotate("old")).thenReturn(new RefreshTokenService.Rotation(user, next));

        AuthSession session = service.refresh("old");

        assertEquals("u-1", jwtUtil.parseAccessToken(session.response().accessToken()).orElseThrow().id());
        assertEquals("next", session.refreshToken().rawToken());
    }

    @Test
    void emailAvailabilityIsCaseInsensitive() {
        when(users.existsByEmail("kamal@example.com")).thenReturn(true);

        assertFalse(service.isEmailAvailable(" Kamal@Example.COM "));
        verify(users).existsByEmail(eq("kamal@example.com"));
    }

    private RegisterRequest customerRequest(String email, ProviderType providerType) {
        return new RegisterRequest(Role.CUSTOMER, providerType, " Kamal   Perera ", "+94 77 123 4567",
                email, PASSWORD, true);
    }

    private User existingUser(AccountStatus status) {
        User user = new User();
        user.setId("u-1");
        user.setEmail("kamal@example.com");
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(Role.CUSTOMER);
        user.setStatus(status);
        return user;
    }

    private static User withId(User user, String id) {
        user.setId(id);
        return user;
    }
}
