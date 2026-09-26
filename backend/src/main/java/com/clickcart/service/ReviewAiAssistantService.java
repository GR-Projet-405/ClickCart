package com.clickcart.service;

import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.clickcart.dto.ReviewAiResponse;

@Service
public class ReviewAiAssistantService {

    private final ReviewModerationService moderationService;

    public ReviewAiAssistantService(
            ReviewModerationService moderationService
    ) {
        this.moderationService = moderationService;
    }

    public ReviewAiResponse improveWriting(String content) {

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

    public ReviewAiResponse makeClearer(String content) {

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
                Character.toUpperCase(cleaned.charAt(0));

        cleaned =
                first + cleaned.substring(1);

        return cleaned;
    }
}