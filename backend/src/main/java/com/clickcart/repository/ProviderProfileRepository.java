package com.clickcart.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.ProviderProfile;

@Repository
public interface ProviderProfileRepository extends MongoRepository<ProviderProfile, String> {

    // Find providers by service category and distance threshold
    List<ProviderProfile> findByServiceCategoryIgnoreCaseAndDistanceKmLessThanEqual(
            String serviceCategory,
            double maxDistanceKm);

    // Fallback query: fetch verified providers when primary matching fails
    List<ProviderProfile> findByIsVerifiedTrue();
}