package com.clickcart.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.clickcart.dto.ProviderProfileRequest;
import com.clickcart.dto.ProviderProfileResponse;
import com.clickcart.model.ProviderProfile;
import com.clickcart.repository.ProviderProfileRepository;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository repository;

    public ProviderProfileService(ProviderProfileRepository repository) {
        this.repository = repository;
    }

    public ProviderProfileResponse saveProfile(String id, ProviderProfileRequest request) {
        ProviderProfile profile;
        LocalDateTime now = LocalDateTime.now();

        if (id != null && !id.isBlank()) {
            Optional<ProviderProfile> existingOpt = repository.findById(id);
            if (existingOpt.isPresent()) {
                profile = existingOpt.get();
                profile.setUpdatedAt(now);
            } else {
                profile = new ProviderProfile();
                profile.setId(id);
                profile.setCreatedAt(now);
                profile.setUpdatedAt(now);
            }
        } else {
            profile = new ProviderProfile();
            profile.setCreatedAt(now);
            profile.setUpdatedAt(now);
        }

        profile.setProviderType(request.getProviderType());
        profile.setFullName(request.getFullName());
        profile.setBusinessName(request.getBusinessName());
        profile.setContactPerson(request.getContactPerson());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setBio(request.getBio());
        profile.setProfileImage(request.getProfileImage());

        ProviderProfile saved = repository.save(profile);
        return toResponse(saved);
    }

    public ProviderProfileResponse getProfile(String id) {
        ProviderProfile profile = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Provider profile not found: " + id));
        return toResponse(profile);
    }

    public ProviderProfileResponse getPublicProfile(String id) {
        return getProfile(id);
    }

    public ProviderProfileResponse getOrCreateDefaultProfile() {
        Optional<ProviderProfile> firstProfile = repository.findAll().stream().findFirst();
        if (firstProfile.isPresent()) {
            return toResponse(firstProfile.get());
        }

        ProviderProfile defaultProfile = new ProviderProfile();
        defaultProfile.setProviderType("individual");
        LocalDateTime now = LocalDateTime.now();
        defaultProfile.setCreatedAt(now);
        defaultProfile.setUpdatedAt(now);

        ProviderProfile saved = repository.save(defaultProfile);
        return toResponse(saved);
    }

    public String calculateProfileStatus(ProviderProfile profile) {
        if (profile == null) {
            return "NOT_STARTED";
        }

        boolean isBusiness = "business".equalsIgnoreCase(profile.getProviderType());

        boolean hasIdentity = isBusiness
                ? isNotBlank(profile.getBusinessName()) && isNotBlank(profile.getContactPerson())
                : isNotBlank(profile.getFullName());

        boolean hasEmail = isNotBlank(profile.getEmail());
        boolean hasPhone = isNotBlank(profile.getPhone());
        boolean hasLocation = isNotBlank(profile.getLocation());

        int filledCount = 0;
        if (hasIdentity) filledCount++;
        if (hasEmail) filledCount++;
        if (hasPhone) filledCount++;
        if (hasLocation) filledCount++;

        if (filledCount == 0) {
            return "NOT_STARTED";
        } else if (filledCount == 4) {
            return "COMPLETED";
        } else {
            return "PARTIALLY_COMPLETED";
        }
    }

    public Integer calculateCompletionPercentage(ProviderProfile profile) {
        if (profile == null) {
            return 0;
        }

        int score = 0;
        boolean isBusiness = "business".equalsIgnoreCase(profile.getProviderType());

        boolean hasIdentity = isBusiness
                ? isNotBlank(profile.getBusinessName()) && isNotBlank(profile.getContactPerson())
                : isNotBlank(profile.getFullName());

        if (hasIdentity) score += 30;
        if (isNotBlank(profile.getEmail())) score += 25;
        if (isNotBlank(profile.getPhone())) score += 25;
        if (isNotBlank(profile.getLocation())) score += 20;

        return score;
    }

    public ProviderProfileResponse toResponse(ProviderProfile profile) {
        if (profile == null) {
            return null;
        }

        String status = calculateProfileStatus(profile);
        Integer percentage = calculateCompletionPercentage(profile);

        String createdAtStr = profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null;
        String updatedAtStr = profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null;

        return new ProviderProfileResponse(
                profile.getId(),
                profile.getProviderType(),
                profile.getFullName(),
                profile.getBusinessName(),
                profile.getContactPerson(),
                profile.getEmail(),
                profile.getPhone(),
                profile.getLocation(),
                profile.getBio(),
                profile.getProfileImage(),
                status,
                percentage,
                createdAtStr,
                updatedAtStr
        );
    }

    private boolean isNotBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
