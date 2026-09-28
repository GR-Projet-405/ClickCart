package com.clickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReviewAiRequest {

    @NotBlank(message = "Review content is required")
    @Size(max = 500, message = "Review content must not exceed 500 characters")
    private String content;

    public ReviewAiRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}