package com.clickcart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "favorites")
public class Favorite {

    @Id
    private String id;

    private String customerId;
    private String targetType;
    private String targetId;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Favorite() {}

    public Favorite(String customerId, String targetType, String targetId) {
        this.customerId = customerId;
        this.targetType = targetType;
        this.targetId = targetId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
