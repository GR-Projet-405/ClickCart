package com.clickcart.repository;

import com.clickcart.model.ServicePricing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ServicePricingRepository extends MongoRepository<ServicePricing, String> {

    // Find pricing configuration for a specific service
    Optional<ServicePricing> findByServiceId(String serviceId);
    // Check if pricing already exists for a service (useful for update vs create logic)
    boolean existsByServiceId(String serviceId);
}
