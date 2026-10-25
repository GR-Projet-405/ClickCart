package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "messages")
@CompoundIndexes({
        @CompoundIndex(name = "idx_conversation_createdat", def = "{ 'conversationId': 1, 'createdAt': 1 }")
})
public class Message {

    @Id
    private String id;

    @Indexed
    @Field("conversationId")
    private String conversationId;

    @Field("bookingId")
    private String bookingId;

    @Field("senderId")
    private String senderId;

    @Field("senderRole")
    private String senderRole;

    @Field("type")
    private MessageType type;

    @Field("content")
    private String content;

    @Field("attachment")
    private AttachmentInfo attachment;

    @Field("readAt")
    private Instant readAt;

    private boolean readByCustomer;
    private boolean readByProvider;

    @CreatedDate
    @Field("createdAt")
    private Instant createdAt;

    public enum MessageType {
        TEXT,
        SYSTEM_EVENT,
        ATTACHMENT
    }

    public static class AttachmentInfo {
        private String storedFilename;
        private String originalFilename;
        private String contentType;
        private long sizeBytes;

        public AttachmentInfo() {
        }

        public String getStoredFilename() {
            return storedFilename;
        }

        public void setStoredFilename(String storedFilename) {
            this.storedFilename = storedFilename;
        }

        public String getOriginalFilename() {
            return originalFilename;
        }

        public void setOriginalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public long getSizeBytes() {
            return sizeBytes;
        }

        public void setSizeBytes(long sizeBytes) {
            this.sizeBytes = sizeBytes;
        }
    }

    public Message() {
    }

    public Message(String conversationId, String senderId, SenderRole senderRole, String content) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderRole = senderRole != null ? senderRole.name() : null;
        this.content = content;
        this.type = MessageType.TEXT;
    }

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

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public void setSenderRole(SenderRole senderRoleEnum) {
        if (senderRoleEnum != null) {
            this.senderRole = senderRoleEnum.name();
        }
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public AttachmentInfo getAttachment() {
        return attachment;
    }

    public void setAttachment(AttachmentInfo attachment) {
        this.attachment = attachment;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public boolean isReadByCustomer() {
        return readByCustomer;
    }

    public void setReadByCustomer(boolean readByCustomer) {
        this.readByCustomer = readByCustomer;
    }

    public boolean isReadByProvider() {
        return readByProvider;
    }

    public void setReadByProvider(boolean readByProvider) {
        this.readByProvider = readByProvider;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}