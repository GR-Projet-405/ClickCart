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
import com.clickcart.exception.DuplicateResourceException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.JwtUtil;
import com.clickcart.util.PhoneNumbers;

/**
 * DEV-01 Authentication & Account Security: registration, login and current-user lookup.
 */
@Service
public class AuthService {

    /** Security audit trail (SRS IAM-012). Logs ids and outcomes only, never passwords or tokens. */
    private static final Logger audit = LoggerFactory.getLogger("clickcart.audit.auth");

    static final String INVALID_CREDENTIALS = "Incorrect email or password";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /** Compared against when the email is unknown so response time does not reveal whether an account exists. */
    private final String dummyPasswordHash;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.dummyPasswordHash = passwordEncoder.encode("clickcart-timing-equalizer");
    }

    public AuthResponse register(RegisterRequest request) {
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
        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = users.findByEmail(email).orElse(null);

        if (user == null) {
            passwordEncoder.matches(request.password(), dummyPasswordHash);
            audit.info("event=LOGIN_FAILED reason=UNKNOWN_EMAIL");
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            audit.info("event=LOGIN_FAILED userId={} reason=BAD_PASSWORD", user.getId());
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        // Checked only after the password matches, so suspension status is not revealed to guessers.
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            audit.info("event=LOGIN_BLOCKED userId={} reason=SUSPENDED", user.getId());
            throw new ForbiddenException("This account has been suspended. Please contact support.");
        }

        Instant now = Instant.now();
        user.setLastLoginAt(now);
        user.setUpdatedAt(now);
        users.save(user);

        audit.info("event=LOGIN_SUCCESS userId={} role={}", user.getId(), user.getRole());
        return issueTokens(user);
    }

    public UserResponse getCurrentUser(String userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Your session is no longer valid. Please log in again."));
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw new ForbiddenException("This account has been suspended. Please contact support.");
        }
        return UserResponse.from(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        return AuthResponse.bearer(accessToken, jwtUtil.getAccessTokenTtlSeconds(), UserResponse.from(user));
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
