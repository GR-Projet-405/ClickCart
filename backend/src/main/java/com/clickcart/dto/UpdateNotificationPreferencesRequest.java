package com.clickcart.dto;

import java.util.Map;

import jakarta.validation.constraints.NotNull;

public class UpdateNotificationPreferencesRequest {

    @NotNull(message = "enabled is required")
    private Map<String, Boolean> enabled;

    public Map<String, Boolean> getEnabled() {
        return enabled;
    }

    public void setEnabled(Map<String, Boolean> enabled) {
        this.enabled = enabled;
    }
}
