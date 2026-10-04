package com.clickcart.controller;

import com.clickcart.dto.provider.ProviderDashboardResponse;
import com.clickcart.service.ProviderDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/dashboard")
@CrossOrigin(origins = "*")
public class ProviderDashboardController {

    private final ProviderDashboardService dashboardService;

    public ProviderDashboardController(ProviderDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ProviderDashboardResponse> getDashboard(
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range,
            @AuthenticationPrincipal Jwt jwt
    ) {
        // For development/local mode without security, use a default provider
        String providerId = "provider-a";
        String displayName = "Provider";

        if (jwt != null) {
            providerId = jwt.getSubject();
            displayName = jwt.getClaimAsString("name");
            if (displayName == null || displayName.isBlank()) {
                displayName = providerId;
            }
        }

        ProviderDashboardResponse response = dashboardService.getDashboardData(
                providerId,
                displayName,
                range
        );
        return ResponseEntity.ok(response);
    }
}
