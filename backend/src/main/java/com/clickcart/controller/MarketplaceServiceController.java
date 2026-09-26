package com.clickcart.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.service.ServiceListingService;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MarketplaceServiceController {

    private final ServiceListingService service;

    public MarketplaceServiceController(ServiceListingService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceListingResponse> listActiveServices() {
        return service.findActiveForMarketplace();
    }
}
