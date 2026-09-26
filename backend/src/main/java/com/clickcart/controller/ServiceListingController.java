package com.clickcart.controller;

import com.clickcart.model.ServiceListing;
import com.clickcart.service.ServiceListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@CrossOrigin(origins = "*")
public class ServiceListingController {

    @Autowired
    private ServiceListingService serviceListingService;

    @GetMapping
    public ResponseEntity<List<ServiceListing>> getAllServices(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(serviceListingService.getServiceListingsByCategory(category));
        }
        return ResponseEntity.ok(serviceListingService.getActiveServiceListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceListing> getServiceById(@PathVariable String id) {
        return serviceListingService.getServiceListingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
