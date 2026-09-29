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
import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Represents a single message within a {@link Conversation}.
 *
 * <p>Messages are stored in their own collection rather than embedded inside
 * {@code Conversation} to support pagination without loading the full history,
 * and to allow efficient unread-count queries without scanning all messages.</p>
 *
 * <p>The {@code readAt} field acts as the read-receipt marker:
 * {@code null} means the recipient has not yet seen this message;
 * a non-null {@link Instant} is the moment it was marked as read.</p>
 *
 * <p>Content is capped at 2 000 characters, validated at the API boundary
 * before persistence (see the corresponding request DTO).</p>
 *
 * <p>Collection: {@code messages}</p>
 */
@Document(collection = "messages")
@CompoundIndexes({
    // Primary query pattern: paginated history for a conversation, oldest-first
    @CompoundIndex(name = "idx_conversation_createdat",
                   def = "{ 'conversationId': 1, 'createdAt': 1 }")
})
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
    /**
     * The conversation this message belongs to.
     * References {@link Conversation#getId()}.
     */
    @Field("conversationId")
    private String conversationId;

    /**
     * ID of the user who sent this message.
     * References the shared user store.
     */
    @Field("senderId")
    private String senderId;

    /**
     * Marketplace role of the sender at the time the message was sent.
     * Stored as a string literal (e.g., {@code "CUSTOMER"} / {@code "PROVIDER"}).
     */
    @Field("senderRole")
    private SenderRole senderRole;

    /**
     * Text content of the message.
     * Must not be blank and must not exceed 2 000 characters.
     * Validation is enforced at the request DTO level before this field is populated.
     */
    @Field("content")
    private String content;

    /**
     * Timestamp at which the recipient read (opened) this message.
     * {@code null} indicates the message is still unread by the recipient.
     */
    @Field("readAt")
    private Instant readAt;

    @CreatedDate
    @Field("createdAt")
    private Instant createdAt;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public Message() {
    }

    public Message(String conversationId, String senderId, SenderRole senderRole, String content) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderRole = senderRole;
        this.content = content;
    }

    // -----------------------------------------------------------------------
    // Getters and setters
    // -----------------------------------------------------------------------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public SenderRole getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(SenderRole senderRole) {
        this.senderRole = senderRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
