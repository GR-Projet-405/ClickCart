package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.ServiceListing;
import com.clickcart.model.ServiceListingStatus;

public interface ServiceListingRepository extends MongoRepository<ServiceListing, String> {
    List<ServiceListing> findAllByProviderIdOrderByUpdatedAtDesc(String providerId);
    List<ServiceListing> findAllByStatusOrderByUpdatedAtDesc(ServiceListingStatus status);
    Optional<ServiceListing> findByIdAndProviderId(String id, String providerId);
}
