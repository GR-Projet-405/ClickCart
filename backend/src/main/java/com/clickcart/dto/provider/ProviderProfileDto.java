package com.clickcart.dto.provider;

public class ProviderProfileDto {
    private String id;
    private String name;
    private String role;
    private String avatar;
    private boolean verified;
    private boolean online;
    private String greeting;
    private String subtitle;
    private int profileCompletion;

    public ProviderProfileDto() {}

    public ProviderProfileDto(String id, String name, String role, String avatar, boolean verified, boolean online, String greeting, String subtitle, int profileCompletion) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.avatar = avatar;
        this.verified = verified;
        this.online = online;
        this.greeting = greeting;
        this.subtitle = subtitle;
        this.profileCompletion = profileCompletion;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    public String getGreeting() { return greeting; }
    public void setGreeting(String greeting) { this.greeting = greeting; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public int getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(int profileCompletion) { this.profileCompletion = profileCompletion; }
}
