package com.clickcart.dto;

import java.util.List;
import java.util.Map;

public class AiSearchResponse {
    private String message;
    private List<Map<String, Object>> results;
    private List<String> categories;

    public AiSearchResponse() {}

    public AiSearchResponse(String message, List<Map<String, Object>> results, List<String> categories) {
        this.message = message;
        this.results = results;
        this.categories = categories;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Map<String, Object>> getResults() { return results; }
    public void setResults(List<Map<String, Object>> results) { this.results = results; }

    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
}