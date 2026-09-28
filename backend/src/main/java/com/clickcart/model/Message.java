package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A single message inside a booking conversation.
 */
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    /** Denormalised for fast access. */
    private String bookingId;

    /** The user who sent this message. */
    private String senderId;

    /** "CUSTOMER" or "PROVIDER" or "SYSTEM". */
    private String senderRole;

    /** Message type: TEXT, SYSTEM_EVENT, ATTACHMENT. */
    private MessageType type;

    /** Actual text content (for TEXT and SYSTEM_EVENT types). */
    private String content;

    /** Attachment metadata (populated when type is ATTACHMENT). */
    private AttachmentInfo attachment;

    /** True once the customer has read this message. */
    private boolean readByCustomer;

    /** True once the provider has read this message. */
    private boolean readByProvider;

    @CreatedDate
    private Instant createdAt;

    // ── Nested types ──────────────────────────────────────────────────────────

    public enum MessageType {
        TEXT,
        SYSTEM_EVENT,
        ATTACHMENT
    }

    public static class AttachmentInfo {
        private String storedFilename;   // opaque server-side name (UUID-based)
        private String originalFilename; // sanitised display name
        private String contentType;
        private long sizeBytes;

        public AttachmentInfo() {}

        public String getStoredFilename() { return storedFilename; }
        public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

        public String getOriginalFilename() { return originalFilename; }
        public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public Message() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public AttachmentInfo getAttachment() { return attachment; }
    public void setAttachment(AttachmentInfo attachment) { this.attachment = attachment; }

    public boolean isReadByCustomer() { return readByCustomer; }
    public void setReadByCustomer(boolean readByCustomer) { this.readByCustomer = readByCustomer; }

    public boolean isReadByProvider() { return readByProvider; }
    public void setReadByProvider(boolean readByProvider) { this.readByProvider = readByProvider; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
