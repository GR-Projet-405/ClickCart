package com.clickcart.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.clickcart.dto.ReviewAiResponse;

@Service
public class ReviewAiAssistantService {

    private final ReviewModerationService moderationService;
    private final List<ReviewAiProvider> aiProviders;

    public ReviewAiAssistantService(
            ReviewModerationService moderationService,
            List<ReviewAiProvider> aiProviders
    ) {
        this.moderationService = moderationService;
        this.aiProviders = aiProviders;
    }

    public ReviewAiResponse improveWriting(String content) {

        String normalized = normalizeContent(content);

        Optional<String> aiSuggestion =
                getActiveProvider()
                        .flatMap(provider ->
                                provider.improveWriting(
                                        normalized
                                )
                        );

        return buildResponse(
                content,
                normalized,
                aiSuggestion
        );
    }

    public ReviewAiResponse makeClearer(String content) {

        String normalized = normalizeContent(content);

        Optional<String> aiSuggestion =
                getActiveProvider()
                        .flatMap(provider ->
                                provider.makeClearer(
                                        normalized
                                )
                        );

        return buildResponse(
                content,
                normalized,
                aiSuggestion
        );
    }

    public ReviewAiResponse checkReview(String content) {

        String cleaned = normalizeContent(content);

        ReviewModerationService.ModerationResult moderation =
                moderationService.moderate(cleaned);

        return new ReviewAiResponse(
                content,
                cleaned,
                moderation.status(),
                new ArrayList<>(moderation.flags()),
                false
        );
    }

    private ReviewAiResponse buildResponse(
            String originalContent,
            String fallbackContent,
            Optional<String> aiSuggestion
    ) {
        String suggestedContent =
                aiSuggestion.orElse(fallbackContent);

        ReviewModerationService.ModerationResult moderation =
                moderationService.moderate(
                        suggestedContent
                );

        return new ReviewAiResponse(
                originalContent,
                suggestedContent,
                moderation.status(),
                new ArrayList<>(moderation.flags()),
                aiSuggestion.isPresent()
        );
    }

    private Optional<ReviewAiProvider> getActiveProvider() {
        return aiProviders
                .stream()
                .filter(ReviewAiProvider::isAvailable)
                .findFirst();
    }

    private String normalizeContent(String content) {

        if (content == null) {
            return "";
        }

        String cleaned = content
                .trim()
                .replaceAll("\\s+", " ");

        if (cleaned.isEmpty()) {
            return cleaned;
        }

        char first =
                Character.toUpperCase(
                        cleaned.charAt(0)
                );

        return first + cleaned.substring(1);
    }
}