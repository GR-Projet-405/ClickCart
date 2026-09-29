package com.clickcart.service;

import java.util.Optional;

public interface ReviewAiProvider {

    Optional<String> improveWriting(String content);

    Optional<String> makeClearer(String content);

    boolean isAvailable();
}