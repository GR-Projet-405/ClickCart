package com.clickcart.dto;

import java.util.List;

import com.clickcart.model.ModerationStatus;

public class ReviewAiResponse {

    private String originalContent;
    private String suggestedContent;
    private ModerationStatus moderationStatus;
    private List<String> flags;
    private boolean aiUsed;

    public ReviewAiResponse() {
    }

    public ReviewAiResponse(
            String originalContent,
            String suggestedContent,
            ModerationStatus moderationStatus,
            List<String> flags,
            boolean aiUsed
    ) {
        this.originalContent = originalContent;
        this.suggestedContent = suggestedContent;
        this.moderationStatus = moderationStatus;
        this.flags = flags;
        this.aiUsed = aiUsed;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getSuggestedContent() {
        return suggestedContent;
    }

    public void setSuggestedContent(String suggestedContent) {
        this.suggestedContent = suggestedContent;
    }

    public ModerationStatus getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
    }

    public List<String> getFlags() {
        return flags;
    }

    public void setFlags(List<String> flags) {
        this.flags = flags;
    }

    public boolean isAiUsed() {
        return aiUsed;
    }

    public void setAiUsed(boolean aiUsed) {
        this.aiUsed = aiUsed;
    }
}