package com.clickcart.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.ProviderVerification;

@Repository
public interface ProviderVerificationRepository extends MongoRepository<ProviderVerification, String> {
    Optional<ProviderVerification> findByUserId(String userId);
}

