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

        String profileId = com.clickcart.security.CurrentProvider.id();
        if (id != null && !id.isBlank()) com.clickcart.security.CurrentProvider.requireOwner(id);

        ProviderProfileResponse response = providerProfileService.saveProfile(profileId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderProfileResponse> getPublicProfile(@PathVariable String id) {
        ProviderProfileResponse response = providerProfileService.getPublicProfile(id);
        return ResponseEntity.ok(response);
    }
}
