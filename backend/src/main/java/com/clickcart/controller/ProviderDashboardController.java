package com.clickcart.controller;

import com.clickcart.dto.provider.ProviderDashboardResponse;
import com.clickcart.security.ProviderContext;
import com.clickcart.security.ProviderPrincipal;
import com.clickcart.service.ProviderDashboardService;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range
    ) {
        ProviderPrincipal principal = ProviderContext.require();
        ProviderDashboardResponse response = dashboardService.getDashboardData(
                principal.providerId(),
                principal.displayName(),
                range
        );
        return ResponseEntity.ok(response);
    }
}
