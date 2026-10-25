package com.clickcart.service;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class FallbackReviewAiProvider implements ReviewAiProvider {

    @Override
    public Optional<String> improveWriting(String content) {
        return Optional.empty();
    }

    @Override
    public Optional<String> makeClearer(String content) {
        return Optional.empty();
    }

    @Override
    public boolean isAvailable() {
        return false;
    }
}