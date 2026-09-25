package com.clickcart.notification.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for updating notification preferences.
 *
 * <p>Optional channels may be toggled. {@code inAppEnabled}, if supplied, is
 * ignored by the service (in-app is always on) but is accepted so clients can
 * send a complete representation without special-casing.
 */
public record UpdateNotificationPreferenceRequest(
        Boolean inAppEnabled,
        Boolean emailEnabled,
        Boolean smsEnabled,
        Boolean whatsappEnabled,
        Boolean pushEnabled,
        List<String> disabledEventTypes
) {
    public UpdateNotificationPreferenceRequest {
        disabledEventTypes = disabledEventTypes == null
                ? new ArrayList<>()
                : new ArrayList<>(disabledEventTypes);
    }
}