package com.clickcart.service;

import com.clickcart.dto.AiSearchResponse;
import com.clickcart.model.ProviderProfile;
import com.clickcart.repository.BookingRepository;
import com.clickcart.repository.ProviderProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiSearchService {

    private final String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final ProviderProfileRepository providerProfileRepository;
    private final BookingRepository bookingRepository;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public AiSearchService(
            ProviderProfileRepository providerProfileRepository,
            BookingRepository bookingRepository,
            @Value("${gemini.api.key:${GEMINI_API_KEY:}}") String apiKey) {
        this.providerProfileRepository = providerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.apiKey = apiKey;
    }

    public AiSearchResponse searchServices(String userQuery) {
        try {
            String category = "";
            String location = "";
            boolean isRelevant = true;

            // 1. Smart AI Mapping for Natural Language
            try {
                String aiPrompt = """
                        You are an AI assistant for a local service marketplace.
                        Analyze this user query: "%s"
                        
                        Our system standard categories are strictly: "AC Repair", "Cleaning", "Plumbing", "Beauty & Salon".
                        
                        Return ONLY a valid JSON object:
                        {
                           "isRelevant": true,
                           "category": "Map the user's intent to one of our standard categories (e.g., if user says 'repair my ac' or 'ac not cooling', return 'AC Repair'; if 'fix pipe', return 'Plumbing'), or return the exact category if mentioned.",
                           "location": "City mentioned like Colombo or Kandy, or null"
                        }
                        """.formatted(userQuery);

                String aiResponseStr = callGeminiApi(aiPrompt);
                JsonNode aiJson = objectMapper.readTree(aiResponseStr.replaceAll("```json", "").replaceAll("```", "").trim());

                if (aiJson.has("isRelevant")) isRelevant = aiJson.get("isRelevant").asBoolean();
                if (aiJson.has("category") && !aiJson.get("category").isNull()) category = aiJson.get("category").asText();
                if (aiJson.has("location") && !aiJson.get("location").isNull()) location = aiJson.get("location").asText();
                
            } catch (Exception e) {
                // Fallback if AI fails: use the user query directly as category/keyword
                category = userQuery;
            }

            // 2. Database Search with Smart Fallback (Handles natural sentences & Category Pills)
            List<ProviderProfile> matchedProviders = new ArrayList<>();
            
            if (category != null && !category.isEmpty()) {
                // First try exact or containing category match
                matchedProviders = providerProfileRepository.findByServiceCategoryContainingIgnoreCase(category);
            }

            // If nothing found by category, search by keywords in business name or category
            if (matchedProviders.isEmpty()) {
                String searchTerm = (category != null && !category.isEmpty()) ? category : userQuery;
                String[] keywords = searchTerm.toLowerCase().split("\\s+");
                
                matchedProviders = providerProfileRepository.findAll().stream().filter(p -> {
                    String cat = p.getServiceCategory() != null ? p.getServiceCategory().toLowerCase() : "";
                    String biz = p.getBusinessName() != null ? p.getBusinessName().toLowerCase() : "";
                    
                    // Match if any keyword from user query matches provider's category or business name
                    for (String kw : keywords) {
                        if (kw.length() > 2 && (cat.contains(kw) || biz.contains(kw))) {
                            return true;
                        }
                    }
                    return false;
                }).collect(Collectors.toList());
            }

            // If still empty (e.g. general query), return all verified providers so the page isn't blank
            if (matchedProviders.isEmpty()) {
                matchedProviders = providerProfileRepository.findAll();
            }

            // 3. Map to Frontend Expected Format
        List<Map<String, Object>> formattedResults = matchedProviders.stream().map(provider -> {
        Map<String, Object> map = new HashMap<>();
        map.put("id", provider.getId());
        map.put("_id", provider.getId());         
        map.put("providerId", provider.getId());  
        map.put("title", provider.getBusinessName() != null && !provider.getBusinessName().isEmpty() ? provider.getBusinessName() : "Service Provider");
        map.put("providerName", provider.getFullName() != null ? provider.getFullName() : "Verified Provider");
        map.put("category", provider.getServiceCategory());
        map.put("location", provider.getLocation());
        map.put("rating", provider.getRating());
        map.put("reviewCount", provider.getReviewCount());
        map.put("priceFrom", provider.getStartingPrice());
        map.put("matchScore", 98);
        map.put("providerVerified", true);
        map.put("imageUrl", provider.getProfileImage());
        return map;
    }).collect(Collectors.toList());

            List<String> suggestedCategories = Arrays.asList("AC Repair", "Cleaning", "Plumbing", "Beauty & Salon");

            return new AiSearchResponse(null, formattedResults, suggestedCategories);

        } catch (Exception e) {
            System.err.println("AI Search Error: " + e.getMessage());
            throw new RuntimeException("Search failed.");
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini AI search is unavailable because GEMINI_API_KEY is not configured.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> requestBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL + apiKey, request, Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
        Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
        return (String) ((List<Map<String, Object>>) contentMap.get("parts")).get(0).get("text");
    }
}
