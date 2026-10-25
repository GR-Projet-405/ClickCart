package com.clickcart.controller;

import java.util.List;
import java.util.Map;
import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.ServiceAreaResponse;
import com.clickcart.service.LocationLookupService;
import com.clickcart.service.ServiceAreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/locations")
public class PublicLocationController {

    private final LocationLookupService locationLookupService;
    private final ServiceAreaService serviceAreaService;

    public PublicLocationController(LocationLookupService locationLookupService, ServiceAreaService serviceAreaService) {
        this.locationLookupService = locationLookupService;
        this.serviceAreaService = serviceAreaService;
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<String>>> getSupportedDistricts() {
        return ResponseEntity.ok(ApiResponse.ok(locationLookupService.getSupportedDistricts()));
    }

    @GetMapping("/presets")
    public ResponseEntity<ApiResponse<Map<String, LocationLookupService.LocationCoordinate>>> getPresetLocations() {
        return ResponseEntity.ok(ApiResponse.ok(locationLookupService.getPresetLocations()));
    }

    @GetMapping("/covering")
    public ResponseEntity<ApiResponse<List<ServiceAreaResponse>>> findCoveringProviders(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String cityName) {
        List<ServiceAreaResponse> covering = serviceAreaService.findCoveringServiceAreas(district, cityName);
        return ResponseEntity.ok(ApiResponse.ok(covering));
    }
}
