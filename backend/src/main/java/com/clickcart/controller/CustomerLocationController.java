package com.clickcart.controller;

import com.clickcart.dto.LocationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers/location")
@CrossOrigin(origins = "*") // In production, this should be restricted
public class CustomerLocationController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateLocation(@RequestBody LocationRequest locationRequest) {
        // Here we would typically save this location to the customer's profile (CUS-002)
        // or set it in their current session/preferences for nearby search.
        
        // For MVP, we simply acknowledge the receipt of the location.
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Location updated successfully");
        response.put("data", locationRequest);
        
        return ResponseEntity.ok(response);
    }
}
