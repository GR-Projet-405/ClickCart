package com.clickcart.controller;

import com.clickcart.dto.provider.ProviderDashboardResponse;
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
            @RequestParam(name = "providerId", required = false, defaultValue = "PROV-1002") String providerId,
            @RequestParam(name = "range", required = false, defaultValue = "7d") String range,
            @RequestParam(name = "metric", required = false, defaultValue = "earnings") String metric
    ) {
        ProviderDashboardResponse response = dashboardService.getDashboardData(providerId, range, metric);
        return ResponseEntity.ok(response);
    }
}
