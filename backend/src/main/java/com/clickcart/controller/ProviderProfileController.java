package com.clickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ProviderProfileRequest;
import com.clickcart.dto.ProviderProfileResponse;
import com.clickcart.service.ProviderProfileService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/provider/profile")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;

    public ProviderProfileController(ProviderProfileService providerProfileService) {
        this.providerProfileService = providerProfileService;
    }

    @GetMapping
    public ResponseEntity<ProviderProfileResponse> getCurrentProfile() {
        ProviderProfileResponse response = providerProfileService.getOrCreateDefaultProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProviderProfileResponse> updateProfile(
            @RequestParam(required = false) String id,
            @RequestBody ProviderProfileRequest request) {

        String profileId = id;
        if (profileId == null || profileId.isBlank()) {
            ProviderProfileResponse defaultProfile = providerProfileService.getOrCreateDefaultProfile();
            profileId = defaultProfile.getId();
        }

        ProviderProfileResponse response = providerProfileService.saveProfile(profileId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> getPublicProfile(@PathVariable String id) {
        ProviderProfileResponse response = providerProfileService.getPublicProfile(id);
        return ResponseEntity.ok(response);
    }
}
