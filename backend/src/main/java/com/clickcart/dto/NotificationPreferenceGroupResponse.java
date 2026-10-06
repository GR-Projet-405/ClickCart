package com.clickcart.dto;

import java.util.ArrayList;
import java.util.List;

public class NotificationPreferenceGroupResponse {

    private String key;
    private String label;
    private List<NotificationPreferenceItemResponse> items = new ArrayList<>();

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public List<NotificationPreferenceItemResponse> getItems() {
        return items;
    }

    public void setItems(List<NotificationPreferenceItemResponse> items) {
        this.items = items;
    }
}
