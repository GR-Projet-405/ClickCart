package com.clickcart.controller;

import com.clickcart.dto.provider.ProviderDashboardResponse;
import com.clickcart.service.ProviderDashboardService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/dashboard")
@CrossOrigin(origins = "*")
public class ProviderDashboardController {

    private final ProviderDashboardService dashboardService;

    @Value("${clickcart.security.enabled:false}")
    private boolean securityEnabled;

    public ProviderDashboardController(ProviderDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ProviderDashboardResponse> getDashboard(
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range,
            @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt
    ) {
        String providerId;
        String displayName;

        if (securityEnabled && jwt != null) {
            // Production mode: use authenticated provider
            providerId = jwt.getSubject();
            displayName = jwt.getClaimAsString("name");
            if (displayName == null || displayName.isBlank()) {
                displayName = providerId;
            }
        } else if (!securityEnabled) {
            // Development mode: use default provider for testing
            providerId = "provider-b";
            displayName = "QuickFix Electrical Services";
        } else {
            // Security enabled but no JWT
            throw new IllegalArgumentException("Authentication required: JWT token missing");
        }

        ProviderDashboardResponse response = dashboardService.getDashboardData(
                providerId,
                displayName,
                range
        );
        return ResponseEntity.ok(response);
    }
}
