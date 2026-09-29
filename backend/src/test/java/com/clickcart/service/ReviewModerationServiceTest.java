package com.clickcart.service;

import com.clickcart.model.ModerationStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ReviewModerationServiceTest {

    private final ReviewModerationService moderationService =
            new ReviewModerationService();

    @Test
    void shouldPublishCleanReview() {
        String content =
                "Kamal arrived on time and completed the AC repair professionally.";

        ReviewModerationService.ModerationResult result =
                moderationService.moderate(content);

        assertEquals(
                ModerationStatus.PUBLISHED,
                result.status()
        );

        assertTrue(result.flags().isEmpty());
    }

    @Test
    void shouldDetectEmailAddress() {
        String content =
                "The service was good. Contact me at test@example.com.";

        ReviewModerationService.ModerationResult result =
                moderationService.moderate(content);

        assertEquals(
                ModerationStatus.NEEDS_CHANGES,
                result.status()
        );

        assertTrue(
                result.flags().contains("PRIVATE_EMAIL_DETECTED")
        );
    }

    @Test
    void shouldDetectPhoneNumber() {
        String content =
                "Good service. Call me on +94 77 123 4567.";

        ReviewModerationService.ModerationResult result =
                moderationService.moderate(content);

        assertEquals(
                ModerationStatus.NEEDS_CHANGES,
                result.status()
        );

        assertTrue(
                result.flags().contains("PRIVATE_PHONE_DETECTED")
        );
    }

    @Test
    void shouldDetectExternalLink() {
        String content =
                "See more details at https://example.com";

        ReviewModerationService.ModerationResult result =
                moderationService.moderate(content);

        assertEquals(
                ModerationStatus.NEEDS_CHANGES,
                result.status()
        );

        assertTrue(
                result.flags().contains("EXTERNAL_LINK_DETECTED")
        );
    }

    @Test
    void shouldDetectAbusiveLanguage() {
        String content =
                "The provider was an idiot and very unprofessional.";

        ReviewModerationService.ModerationResult result =
                moderationService.moderate(content);

        assertEquals(
                ModerationStatus.NEEDS_CHANGES,
                result.status()
        );

        assertTrue(
                result.flags().contains("ABUSIVE_LANGUAGE")
        );
    }

    @Test
    void shouldRejectEmptyContent() {
        ReviewModerationService.ModerationResult result =
                moderationService.moderate("   ");

        assertEquals(
                ModerationStatus.NEEDS_CHANGES,
                result.status()
        );

        assertTrue(
                result.flags().contains("EMPTY_CONTENT")
        );
    }
}