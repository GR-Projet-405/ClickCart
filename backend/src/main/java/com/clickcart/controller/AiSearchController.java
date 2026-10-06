package com.clickcart.controller;

import com.clickcart.dto.AiSearchResponse;
import com.clickcart.service.AiSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173") // Frontend for development, adjust as needed for production
public class AiSearchController {

    private final AiSearchService aiSearchService;

    public AiSearchController(AiSearchService aiSearchService) {
        this.aiSearchService = aiSearchService;
    }

    @PostMapping("/search")
    public ResponseEntity<AiSearchResponse> searchServices(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        
        if (query == null && !payload.isEmpty()) {
            query = payload.values().iterator().next();
        }

        AiSearchResponse response = aiSearchService.searchServices(query != null ? query : "");
        
        return ResponseEntity.ok(response);
    }
}