package com.clickcart.controller;

import com.clickcart.model.Location;
import com.clickcart.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@CrossOrigin(origins = "*") // For MVP
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/autocomplete")
    public ResponseEntity<List<Location>> autocompleteLocations(@RequestParam("q") String query) {
        List<Location> results = locationService.searchLocations(query);
        return ResponseEntity.ok(results);
    }
}
