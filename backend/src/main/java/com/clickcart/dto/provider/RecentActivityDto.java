package com.clickcart.dto.provider;

public class RecentActivityDto {
    private String id;
    private String type;
    private String title;
    private String service;
    private String code;
    private String timeAgo;
    private String iconType;

    public RecentActivityDto() {}

    public RecentActivityDto(String id, String type, String title, String service, String code, String timeAgo, String iconType) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.service = service;
        this.code = code;
        this.timeAgo = timeAgo;
        this.iconType = iconType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public String getIconType() { return iconType; }
    public void setIconType(String iconType) { this.iconType = iconType; }
}
