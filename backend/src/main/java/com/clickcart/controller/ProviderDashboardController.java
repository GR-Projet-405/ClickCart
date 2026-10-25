package com.clickcart.controller;

import com.clickcart.dto.provider.ProviderDashboardResponse;
import com.clickcart.service.ProviderDashboardService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/dashboard")
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
        String providerId = com.clickcart.security.CurrentProvider.id();
        String displayName = "Service Provider";

        ProviderDashboardResponse response = dashboardService.getDashboardData(
                providerId,
                displayName,
                range
        );
        return ResponseEntity.ok(response);
    }
}
