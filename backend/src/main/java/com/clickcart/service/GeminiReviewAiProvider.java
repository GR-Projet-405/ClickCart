package com.clickcart.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

@Component
public class GeminiReviewAiProvider implements ReviewAiProvider {

    private static final Logger logger =
            LoggerFactory.getLogger(GeminiReviewAiProvider.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiReviewAiProvider(
            RestClient.Builder restClientBuilder,
            @Value("${GEMINI_API_KEY:}") String apiKey,
            @Value("${GEMINI_MODEL:gemini-3.5-flash-lite}") String model
    ) {
        this.restClient = restClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();

        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public Optional<String> improveWriting(String content) {
        String prompt = """
                Improve the grammar and readability of the customer review below.

                Rules:
                - Preserve the customer's original meaning.
                - Preserve the customer's sentiment.
                - Do not invent experiences or facts.
                - Do not add names, dates, events, or claims.
                - Do not make the review more positive or negative.
                - Keep the result under 500 characters.
                - Return only the revised review text.

                Customer review:
                """ + content;

        return generate(prompt);
    }

    @Override
    public Optional<String> makeClearer(String content) {
        String prompt = """
                Rewrite the customer review below so it is clearer and easier to read.

                Rules:
                - Preserve the original meaning and sentiment.
                - Do not invent any information.
                - Do not remove important factual details.
                - Do not change the customer's opinion.
                - Keep the result under 500 characters.
                - Return only the revised review text.

                Customer review:
                """ + content;

        return generate(prompt);
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    private Optional<String> generate(String prompt) {

        if (!isAvailable()
                || prompt == null
                || prompt.isBlank()) {
            return Optional.empty();
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 250
                )
        );

        try {
            JsonNode response = restClient
                    .post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            String generatedText = extractText(response);

            if (generatedText == null) {
                return Optional.empty();
            }

            generatedText = generatedText.trim();

            if (generatedText.isBlank()
                    || generatedText.length() > 500) {
                return Optional.empty();
            }

            return Optional.of(generatedText);

        } catch (Exception exception) {
            logger.warn(
                    "Gemini review assistance unavailable; "
                            + "using local fallback. Error: {}",
                    exception.getClass().getSimpleName()
            );

            return Optional.empty();
        }
    }

    private String extractText(JsonNode response) {

        if (response == null) {
            return null;
        }

        JsonNode candidates = response.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            return null;
        }

        JsonNode parts = candidates
                .get(0)
                .path("content")
                .path("parts");

        if (!parts.isArray() || parts.isEmpty()) {
            return null;
        }

        return parts
                .get(0)
                .path("text")
                .asText(null);
    }
}