package com.clickcart.repository;

import com.clickcart.model.AvailabilityRule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AvailabilityRuleRepository extends MongoRepository<AvailabilityRule, String> {

    List<AvailabilityRule> findByProviderId(String providerId);

    List<AvailabilityRule> findByProviderIdAndDayOfWeek(
            String providerId,
            java.time.DayOfWeek dayOfWeek
    );

    List<AvailabilityRule> findByProviderIdAndActiveTrue(String providerId);
}