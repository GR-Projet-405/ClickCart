package com.clickcart.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.auth.AuthResponse;
import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.dto.auth.ForgotPasswordRequest;
import com.clickcart.dto.auth.ForgotPasswordResponse;
import com.clickcart.dto.auth.LoginRequest;
import com.clickcart.dto.auth.PasswordResetResponse;
import com.clickcart.dto.auth.RegisterRequest;
import com.clickcart.dto.auth.ResetPasswordRequest;
import com.clickcart.dto.auth.UserResponse;
import com.clickcart.dto.auth.VerifyResetCodeRequest;
import com.clickcart.dto.auth.VerifyResetCodeResponse;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.service.AuthService;
import com.clickcart.service.PasswordResetService;
import com.clickcart.service.AuthService.AuthSession;
import com.clickcart.util.AuthCookies;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DEV-01 Authentication API.
 * The access token is returned in the body; the refresh token is set as an httpOnly cookie.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final AuthCookies authCookies;

    public AuthController(AuthService authService, PasswordResetService passwordResetService,
                          AuthCookies authCookies) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.authCookies = authCookies;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthSession session = authService.register(request);
        return withSessionCookie(ResponseEntity.status(HttpStatus.CREATED), session, "Account created successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthSession session = authService.login(request);
        return withSessionCookie(ResponseEntity.ok(), session, "Logged in successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = AuthCookies.REFRESH_COOKIE, required = false) String refreshToken) {
        AuthSession session = authService.refresh(refreshToken);
        return withSessionCookie(ResponseEntity.ok(), session, "Session refreshed");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = AuthCookies.REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.clearedRefreshCookie().toString())
                .body(ApiResponse.ok("Logged out successfully", null));
    }

    @GetMapping("/email-availability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> emailAvailability(
            @RequestParam
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            @Size(max = 254, message = "Email is too long")
            String email) {
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("available", available)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = passwordResetService.requestCode(request.email());
        return ResponseEntity.ok(ApiResponse.ok(
                "If an account exists for this email, we've sent a 6-digit code.", response));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<ApiResponse<VerifyResetCodeResponse>> verifyResetCode(
            @Valid @RequestBody VerifyResetCodeRequest request) {
        VerifyResetCodeResponse response = passwordResetService.verifyCode(request.email(), request.code());
        return ResponseEntity.ok(ApiResponse.ok("Code verified", response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        PasswordResetResponse response = passwordResetService.resetPassword(request.resetToken(), request.newPassword());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.clearedRefreshCookie().toString())
                .body(ApiResponse.ok("Password updated. Other devices have been signed out.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        // The dev fallback identity is not a real account, so it cannot use /me.
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new UnauthorizedException("Please log in to continue");
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(user.id())));
    }

    private ResponseEntity<ApiResponse<AuthResponse>> withSessionCookie(
            ResponseEntity.BodyBuilder builder, AuthSession session, String message) {
        return builder
                .header(HttpHeaders.SET_COOKIE, authCookies.refreshCookie(session.refreshToken()).toString())
                .body(ApiResponse.ok(message, session.response()));
    }
}
