package com.clickcart.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.ProviderProfile;

@Repository
public interface ProviderProfileRepository extends MongoRepository<ProviderProfile, String> {
}
