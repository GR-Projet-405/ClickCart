package com.clickcart.dto;

import java.util.ArrayList;
import java.util.List;

public class NotificationPreferencesResponse {

    private List<NotificationPreferenceGroupResponse> groups = new ArrayList<>();

    public List<NotificationPreferenceGroupResponse> getGroups() {
        return groups;
    }

    public void setGroups(List<NotificationPreferenceGroupResponse> groups) {
        this.groups = groups;
    }
}
