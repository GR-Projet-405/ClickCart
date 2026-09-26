package com.clickcart.service;

import com.clickcart.model.ServiceListing;
import com.clickcart.repository.ServiceListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceListingService {

    @Autowired
    private ServiceListingRepository serviceListingRepository;

    public List<ServiceListing> getAllServiceListings() {
        return serviceListingRepository.findAll();
    }

    public List<ServiceListing> getActiveServiceListings() {
        return serviceListingRepository.findByStatus("ACTIVE");
    }

    public List<ServiceListing> getServiceListingsByCategory(String category) {
        return serviceListingRepository.findByCategory(category);
    }

    public Optional<ServiceListing> getServiceListingById(String id) {
        return serviceListingRepository.findById(id);
    }
}
