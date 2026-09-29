package com.clickcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ReviewAiRequest;
import com.clickcart.dto.ReviewAiResponse;
import com.clickcart.service.ReviewAiAssistantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reviews/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewAiController {

    private final ReviewAiAssistantService aiAssistantService;

    public ReviewAiController(
            ReviewAiAssistantService aiAssistantService
    ) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/improve-writing")
    public ResponseEntity<ReviewAiResponse> improveWriting(
            @Valid @RequestBody ReviewAiRequest request
    ) {
        return ResponseEntity.ok(
                aiAssistantService.improveWriting(
                        request.getContent()
                )
        );
    }

    @PostMapping("/make-clearer")
    public ResponseEntity<ReviewAiResponse> makeClearer(
            @Valid @RequestBody ReviewAiRequest request
    ) {
        return ResponseEntity.ok(
                aiAssistantService.makeClearer(
                        request.getContent()
                )
        );
    }

    @PostMapping("/check")
    public ResponseEntity<ReviewAiResponse> checkReview(
            @Valid @RequestBody ReviewAiRequest request
    ) {
        return ResponseEntity.ok(
                aiAssistantService.checkReview(
                        request.getContent()
                )
        );
    }
}