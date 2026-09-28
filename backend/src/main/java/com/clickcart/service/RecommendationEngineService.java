package com.clickcart.service;

import com.clickcart.model.ProviderProfile;
import com.clickcart.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationEngineService {

    @Autowired
    private ProviderRepository providerRepository;

    /**
     * Calculates multi-factor match scores using MongoDB queries.
     */
    public List<ProviderProfile> calculateMatches(String serviceCategory, String location, double maxDistanceKm) {
        List<ProviderProfile> providers = providerRepository
            .findByServiceCategoryIgnoreCaseAndDistanceKmLessThanEqual(serviceCategory, maxDistanceKm);

        // Sort by match score descending
        providers.sort((p1, p2) -> Integer.compare(p2.getMatchScore(), p1.getMatchScore()));
        return providers;
    }

    /**
     * Fallback mechanism (AIF-007) returning standard verified listings if primary engine fails.
     */
    public List<ProviderProfile> getFallbackProviders(String serviceCategory) {
        List<ProviderProfile> verifiedList = providerRepository.findByIsVerifiedTrue();
        return verifiedList.stream().limit(3).toList();
    }

    public ProviderProfile findById(String providerId) {
        return providerRepository.findById(providerId).orElse(null);
    }
}