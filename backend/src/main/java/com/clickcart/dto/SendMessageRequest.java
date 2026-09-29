package com.clickcart.dto;

import com.clickcart.model.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Request body for sending a text message. */
public class SendMessageRequest {

    @NotBlank(message = "conversationId is required")
    private String conversationId;

    @NotBlank(message = "senderId is required")
    private String senderId;

    /**
     * Must be one of: CUSTOMER, PROVIDER, SYSTEM
     */
    @NotBlank(message = "senderRole is required")
    private String senderRole;

    @NotNull(message = "type is required")
    private Message.MessageType type;

    /** Required when type is TEXT or SYSTEM_EVENT. */
    private String content;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public Message.MessageType getType() { return type; }
    public void setType(Message.MessageType type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
