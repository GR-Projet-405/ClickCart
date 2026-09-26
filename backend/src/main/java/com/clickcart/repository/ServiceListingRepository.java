package com.clickcart.repository;

import com.clickcart.model.ServiceListing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceListingRepository extends MongoRepository<ServiceListing, String> {
    List<ServiceListing> findByCategory(String category);
    List<ServiceListing> findByStatus(String status);
}
