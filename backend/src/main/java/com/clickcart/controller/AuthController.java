package com.clickcart.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.auth.AuthResponse;
import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.dto.auth.LoginRequest;
import com.clickcart.dto.auth.RegisterRequest;
import com.clickcart.dto.auth.UserResponse;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.service.AuthService;

import jakarta.validation.Valid;

/**
 * DEV-01 Authentication API.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Account created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Logged in successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        // The dev fallback identity is not a real account, so it cannot use /me.
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new UnauthorizedException("Please log in to continue");
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(user.id())));
    }
}
