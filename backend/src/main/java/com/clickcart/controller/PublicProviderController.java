package com.clickcart.controller;

import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceAreaResponse;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.service.ServiceAreaService;
import com.clickcart.service.ServiceListingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/providers/{providerId}")
public class PublicProviderController {
    private final ServiceListingService listings;
    private final ServiceAreaService areas;
    public PublicProviderController(ServiceListingService listings, ServiceAreaService areas) {
        this.listings = listings;
        this.areas = areas;
    }
    @GetMapping("/services")
    public List<ServiceListingResponse> services(@PathVariable String providerId) {
        return listings.findPublicForProvider(providerId);
    }
    @GetMapping("/service-areas")
    public PagedResponse<ServiceAreaResponse> areas(@PathVariable String providerId) {
        return areas.getServiceAreas(providerId, "", "ACTIVE", "", 0, 50);
    }
}
