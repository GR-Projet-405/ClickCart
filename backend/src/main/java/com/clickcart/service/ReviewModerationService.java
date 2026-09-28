package com.clickcart.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.clickcart.model.ModerationStatus;

@Service
public class ReviewModerationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?<!\\w)(?:\\+?\\d[\\d\\s().-]{7,}\\d)(?!\\w)"
    );

    private static final Pattern LINK_PATTERN = Pattern.compile(
            "(?i)(https?://|www\\.|\\b[a-z0-9.-]+\\.(com|net|org|lk)\\b)"
    );

    private static final Pattern EXCESSIVE_REPETITION_PATTERN =
            Pattern.compile("(.)\\1{7,}");

    private static final List<String> ABUSIVE_TERMS = List.of(
            "idiot",
            "stupid",
            "moron"
    );

    public ModerationResult moderate(String content) {

        List<String> flags = new ArrayList<>();

        if (content == null || content.isBlank()) {
            flags.add("EMPTY_CONTENT");

            return new ModerationResult(
                    ModerationStatus.NEEDS_CHANGES,
                    flags
            );
        }

        String normalized = content
                .trim()
                .toLowerCase(Locale.ROOT);

        if (EMAIL_PATTERN.matcher(content).find()) {
            flags.add("PRIVATE_EMAIL_DETECTED");
        }

        if (PHONE_PATTERN.matcher(content).find()) {
            flags.add("PRIVATE_PHONE_DETECTED");
        }

        if (LINK_PATTERN.matcher(content).find()) {
            flags.add("EXTERNAL_LINK_DETECTED");
        }

        if (EXCESSIVE_REPETITION_PATTERN.matcher(content).find()) {
            flags.add("POSSIBLE_SPAM");
        }

        if (containsAbusiveLanguage(normalized)) {
            flags.add("ABUSIVE_LANGUAGE");
        }

        /*
         * Content that clearly violates deterministic safety rules
         * should be corrected by the author before publishing.
         */
        if (!flags.isEmpty()) {
            return new ModerationResult(
                    ModerationStatus.NEEDS_CHANGES,
                    flags
            );
        }

        /*
         * Clean content can be published.
         *
         * Semantic checks such as "relevant to the completed job"
         * can later be assisted by the optional AI moderation layer.
         */
        return new ModerationResult(
                ModerationStatus.PUBLISHED,
                flags
        );
    }

    private boolean containsAbusiveLanguage(String content) {
        return ABUSIVE_TERMS.stream()
                .anyMatch(term ->
                        Pattern.compile(
                                "\\b" + Pattern.quote(term) + "\\b"
                        )
                        .matcher(content)
                        .find()
                );
    }

    public record ModerationResult(
            ModerationStatus status,
            List<String> flags
    ) {
    }
}