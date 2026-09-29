package com.clickcart.service;

import com.clickcart.model.Location;
import com.clickcart.repository.LocationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    public List<Location> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return locationRepository.findByNameContainingIgnoreCase(query);
    }

    @PostConstruct
    public void seedData() {
        if (locationRepository.count() == 0) {
            List<Location> seedLocations = Arrays.asList(
                new Location("Negombo", "Western Province, Sri Lanka", 7.2008, 79.8737),
                new Location("Negombo Beach Road", "Negombo, Western Province", 7.2215, 79.8402),
                new Location("Neluwa", "Southern Province, Sri Lanka", 6.3533, 80.3756),
                new Location("New Kandy Road", "Kandy, Central Province", 7.2906, 80.6337),
                new Location("Nawala", "Colombo, Western Province", 6.8906, 79.8829)
            );
            locationRepository.saveAll(seedLocations);
        }
    }
}
