package com.clickcart.notification.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * API response payload for a user's notification preferences.
 */
public record NotificationPreferenceResponse(
        String userId,
        boolean inAppEnabled,
        boolean emailEnabled,
        boolean smsEnabled,
        boolean whatsappEnabled,
        boolean pushEnabled,
        List<String> disabledEventTypes
) {
    public NotificationPreferenceResponse {
        disabledEventTypes = disabledEventTypes == null
                ? List.of()
                : List.copyOf(disabledEventTypes);
    }
}