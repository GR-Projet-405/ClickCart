package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import com.clickcart.dto.auth.AuthResponse;
import com.clickcart.dto.auth.LoginRequest;
import com.clickcart.dto.auth.RegisterRequest;
import com.clickcart.exception.DuplicateResourceException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSWORD = "Secret123";

    @Mock
    private UserRepository users;

    // Low cost factor keeps the tests fast; production uses 12.
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);
    private final JwtUtil jwtUtil = new JwtUtil("test-secret-that-is-long-enough-for-hs256-signing", 15);

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(users, passwordEncoder, jwtUtil);
    }

    @Test
    void registerCustomerHashesPasswordNormalizesInputAndReturnsToken() {
        when(users.existsByEmail("kamal@example.com")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(inv -> withId(inv.getArgument(0), "u-1"));

        AuthResponse response = service.register(customerRequest("  Kamal@Example.com ", ProviderType.BUSINESS));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        User user = saved.getValue();
        assertEquals("kamal@example.com", user.getEmail());
        assertEquals("+94771234567", user.getPhone());
        assertEquals(Role.CUSTOMER, user.getRole());
        assertNull(user.getProviderType(), "customers never get a provider type");
        assertNotEquals(PASSWORD, user.getPasswordHash());
        assertTrue(passwordEncoder.matches(PASSWORD, user.getPasswordHash()));

        assertEquals("Bearer", response.tokenType());
        assertEquals("u-1", jwtUtil.parseAccessToken(response.accessToken()).orElseThrow().id());
    }

    @Test
    void registerProviderKeepsProviderType() {
        when(users.save(any(User.class))).thenAnswer(inv -> withId(inv.getArgument(0), "p-1"));

        AuthResponse response = service.register(new RegisterRequest(Role.SERVICE_PROVIDER, ProviderType.INDIVIDUAL,
                "Kamal Perera", "0771234567", "kamal@example.com", PASSWORD, true));

        assertEquals(ProviderType.INDIVIDUAL, response.user().providerType());
        assertEquals(Role.SERVICE_PROVIDER, jwtUtil.parseAccessToken(response.accessToken()).orElseThrow().role());
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
    void loginWithCorrectPasswordReturnsToken() {
        User user = existingUser(AccountStatus.ACTIVE);
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = service.login(new LoginRequest("KAMAL@example.com", PASSWORD, false));

        assertEquals("u-1", response.user().id());
        assertEquals(Role.CUSTOMER, jwtUtil.parseAccessToken(response.accessToken()).orElseThrow().role());
    }

    @Test
    void loginWithWrongPasswordAndUnknownEmailGiveTheSameError() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.ACTIVE)));
        when(users.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        UnauthorizedException wrongPassword = assertThrows(UnauthorizedException.class,
                () -> service.login(new LoginRequest("kamal@example.com", "Wrong123", false)));
        UnauthorizedException unknownEmail = assertThrows(UnauthorizedException.class,
                () -> service.login(new LoginRequest("nobody@example.com", PASSWORD, false)));

        assertEquals(wrongPassword.getMessage(), unknownEmail.getMessage());
    }

    @Test
    void suspendedAccountCannotLogIn() {
        when(users.findByEmail("kamal@example.com")).thenReturn(Optional.of(existingUser(AccountStatus.SUSPENDED)));

        assertThrows(ForbiddenException.class,
                () -> service.login(new LoginRequest("kamal@example.com", PASSWORD, false)));
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
