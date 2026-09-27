package com.clickcart.service;

import java.time.Instant;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clickcart.dto.auth.AuthResponse;
import com.clickcart.dto.auth.LoginRequest;
import com.clickcart.dto.auth.RegisterRequest;
import com.clickcart.dto.auth.UserResponse;
import com.clickcart.exception.AuthException;
import com.clickcart.exception.DuplicateResourceException;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.service.LoginAttemptService.FailureOutcome;
import com.clickcart.service.RefreshTokenService.IssuedRefreshToken;
import com.clickcart.service.RefreshTokenService.Rotation;
import com.clickcart.util.JwtUtil;
import com.clickcart.util.PhoneNumbers;

/**
 * DEV-01 Authentication & Account Security: registration, login, session refresh/logout and current user.
 */
@Service
public class AuthService {

    /** Security audit trail (SRS IAM-012). Logs ids and outcomes only, never passwords or tokens. */
    private static final Logger audit = LoggerFactory.getLogger("clickcart.audit.auth");

    /** Remaining attempts are only revealed when the user is close to being locked out. */
    static final int SHOW_REMAINING_AT_OR_BELOW = 2;

    /** Access token for the response body plus the refresh token the controller puts in a cookie. */
    public record AuthSession(AuthResponse response, IssuedRefreshToken refreshToken) {
    }

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokens;
    private final LoginAttemptService loginAttempts;

    /** Compared against when the email is unknown so response time does not reveal whether an account exists. */
    private final String dummyPasswordHash;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       RefreshTokenService refreshTokens, LoginAttemptService loginAttempts) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokens = refreshTokens;
        this.loginAttempts = loginAttempts;
        this.dummyPasswordHash = passwordEncoder.encode("clickcart-timing-equalizer");
    }

    public AuthSession register(RegisterRequest request) {
        Role role = request.role();
        if (!role.isSelfRegistrable()) {
            throw new IllegalArgumentException("Admin accounts cannot be created through registration");
        }
        if (role == Role.SERVICE_PROVIDER && request.providerType() == null) {
            throw new IllegalArgumentException("Choose a provider type: Individual or Business");
        }

        String email = normalizeEmail(request.email());
        if (users.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        Instant now = Instant.now();
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim().replaceAll("\\s+", " "));
        user.setPhone(PhoneNumbers.normalizeSriLankaMobile(request.phone()));
        user.setRole(role);
        user.setProviderType(role == Role.SERVICE_PROVIDER ? request.providerType() : null);
        user.setStatus(AccountStatus.ACTIVE);
        user.setTermsAcceptedAt(now);
        user.setPasswordChangedAt(now);
        user.setLastLoginAt(now);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        try {
            user = users.save(user);
        } catch (DuplicateKeyException ex) {
            // Two sign-ups with the same email raced past the exists check; the unique index rejects one.
            throw new DuplicateResourceException("An account with this email already exists");
        }

        audit.info("event=REGISTER userId={} role={}", user.getId(), user.getRole());
        return startSession(user, false);
    }

    public AuthSession login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = users.findByEmail(email).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.password(), dummyPasswordHash);
            audit.info("event=LOGIN_FAILED reason=UNKNOWN_EMAIL");
            throw AuthException.invalidCredentials(null);
        }

        Instant now = Instant.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            audit.info("event=LOGIN_BLOCKED userId={} reason=LOCKED", user.getId());
            throw AuthException.accountLocked(user.getLockedUntil());
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            FailureOutcome outcome = loginAttempts.recordFailure(user.getId());
            if (outcome.locked()) {
                audit.warn("event=ACCOUNT_LOCKED userId={} until={}", user.getId(), outcome.lockedUntil());
                throw AuthException.accountLocked(outcome.lockedUntil());
            }
            audit.info("event=LOGIN_FAILED userId={} reason=BAD_PASSWORD", user.getId());
            int remaining = outcome.attemptsRemaining();
            throw AuthException.invalidCredentials(remaining <= SHOW_REMAINING_AT_OR_BELOW ? remaining : null);
        }

        // Checked only after the password matches, so suspension status is not revealed to guessers.
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            audit.info("event=LOGIN_BLOCKED userId={} reason=SUSPENDED", user.getId());
            throw AuthException.accountSuspended();
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        users.save(user);

        audit.info("event=LOGIN_SUCCESS userId={} role={} rememberMe={}", user.getId(), user.getRole(),
                request.rememberMe());
        return startSession(user, request.rememberMe());
    }

    public AuthSession refresh(String rawRefreshToken) {
        Rotation rotation = refreshTokens.rotate(rawRefreshToken);
        User user = rotation.user();
        return new AuthSession(accessResponse(user), rotation.refreshToken());
    }

    public void logout(String rawRefreshToken) {
        refreshTokens.revoke(rawRefreshToken);
        audit.info("event=LOGOUT");
    }

    public boolean isEmailAvailable(String email) {
        return !users.existsByEmail(normalizeEmail(email));
    }

    public UserResponse getCurrentUser(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Your session is no longer valid. Please log in again."));
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw AuthException.accountSuspended();
        }
        return UserResponse.from(user);
    }

    private AuthSession startSession(User user, boolean rememberMe) {
        IssuedRefreshToken refreshToken = refreshTokens.issue(user.getId(), rememberMe);
        return new AuthSession(accessResponse(user), refreshToken);
    }

    private AuthResponse accessResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        return AuthResponse.bearer(accessToken, jwtUtil.getAccessTokenTtlSeconds(), UserResponse.from(user));
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
