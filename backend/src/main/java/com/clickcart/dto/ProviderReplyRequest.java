package com.clickcart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProviderReplyRequest {

    @NotBlank(message = "Provider response is required")
    @Size(
            max = 300,
            message = "Provider response must not exceed 300 characters"
    )
    private String response;

    public ProviderReplyRequest() {
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}