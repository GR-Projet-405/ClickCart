package com.clickcart.controller;

import com.clickcart.model.ProviderProfile;
import com.clickcart.service.RecommendationEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recommendations")
@CrossOrigin(origins = "*")
public class ProviderRecommendationController {

    @Autowired
    private RecommendationEngineService recommendationService;

    /**
     * Get sorted and matched providers based on customer query criteria.
     */
    @GetMapping("/match")
    public ResponseEntity<?> getProviderMatches(
            @RequestParam String service,
            @RequestParam String location,
            @RequestParam(defaultValue = "10.0") double maxDistance) {
        try {
            List<ProviderProfile> matches = recommendationService.calculateMatches(service, location, maxDistance);
            
            // If primary engine returns empty, trigger fallback heuristic (AIF-007)
            if (matches.isEmpty()) {
                matches = recommendationService.getFallbackProviders(service);
            }

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "totalMatches", matches.size(),
                "data", matches
            ));
        } catch (Exception ex) {
            // Graceful fallback execution per requirement AIF-007
            List<ProviderProfile> fallback = recommendationService.getFallbackProviders(service);
            return ResponseEntity.ok(Map.of(
                "status", "FALLBACK_TRIGGERED",
                "message", "Primary recommendation engine unavailable. Displaying standard verified listings.",
                "data", fallback
            ));
        }
    }

    /**
     * Get a specific provider's details and explainability breakdown by ID.
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getProviderDetails(@PathVariable String providerId) {
        ProviderProfile profile = recommendationService.findById(providerId);
        if (profile == null) {
            return ResponseEntity.status(404).body(Map.of(
                "status", "ERROR",
                "message", "Provider not found."
            ));
        }
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", profile
        ));
    }
}