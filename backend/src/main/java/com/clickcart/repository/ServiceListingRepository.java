package com.clickcart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.ServiceListing;
import com.clickcart.model.ServiceListingStatus;

@Repository
public interface ServiceListingRepository extends MongoRepository<ServiceListing, String> {
    List<ServiceListing> findAllByProviderIdOrderByUpdatedAtDesc(String providerId);
    List<ServiceListing> findAllByStatusOrderByUpdatedAtDesc(ServiceListingStatus status);
    Optional<ServiceListing> findByIdAndProviderId(String id, String providerId);
    
    // For Map & Location Discovery
    List<ServiceListing> findByCategory(String category);
    List<ServiceListing> findByStatus(String status);
}
