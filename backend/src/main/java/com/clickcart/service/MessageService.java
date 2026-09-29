package com.clickcart.service;

import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.exception.InvalidAttachmentException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.Message;
import com.clickcart.model.SenderRole;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    @Value("${clickcart.attachments.dir:${java.io.tmpdir}/clickcart-attachments}")
    private String attachmentsDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain");

    private static final int PREVIEW_MAX_LENGTH = 120;

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationService conversationService;

    public MessageService(MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            @Lazy ConversationService conversationService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.conversationService = conversationService;
    }

    public List<Message> getMessages(String conversationId, String userId, String role) {
        conversationService.getConversation(conversationId, userId, role);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public Message sendMessage(com.clickcart.dto.SendMessageRequest req, String userId, String role) {
        Conversation conv = conversationService.getConversation(req.getConversationId(), userId, role);

        if (req.getType() == Message.MessageType.TEXT && !StringUtils.hasText(req.getContent())) {
            throw new IllegalArgumentException("Message content must not be empty.");
        }

        Message msg = new Message();
        msg.setConversationId(req.getConversationId());
        msg.setBookingId(conv.getBookingId());
        msg.setSenderId(userId);
        msg.setSenderRole(role.toUpperCase());
        msg.setType(req.getType());
        msg.setContent(req.getContent());
        msg.setReadByCustomer("CUSTOMER".equalsIgnoreCase(role));
        msg.setReadByProvider("PROVIDER".equalsIgnoreCase(role));

        Message saved = messageRepository.save(msg);

        String preview = req.getContent() != null
                ? req.getContent().substring(0, Math.min(req.getContent().length(), 80))
                : "[message]";
        conversationService.updateLastMessage(req.getConversationId(), preview, role);

        return saved;
    }

    public MessageResponse sendMessage(String conversationId,
            String currentUserId,
            com.clickcart.dto.messaging.SendMessageRequest request) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        SenderRole senderRole = conversationService.roleOf(conv, currentUserId);

        Message message = new Message(conversationId, currentUserId, senderRole, request.getContent());
        message.setSenderRole(senderRole.name());
        message = messageRepository.save(message);

        conv.setLastMessageText(truncatePreview(request.getContent()));
        conv.setLastMessageAt(message.getCreatedAt());
        incrementRecipientUnread(conv, senderRole);
        conversationRepository.save(conv);

        publishMessageReceivedEvent(conv, currentUserId, senderRole, request.getContent());

        return toResponse(message);
    }

    public PagedMessagesResponse getMessages(String conversationId,
            String currentUserId,
            Pageable pageable) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        Slice<Message> slice = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);

        List<MessageResponse> responses = slice.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new PagedMessagesResponse(
                responses,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                slice.hasNext());
    }

    public void markAsRead(String conversationId, String currentUserId) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        List<Message> unread = messageRepository
                .findUnreadMessagesForRecipient(conversationId, currentUserId);

        if (!unread.isEmpty()) {
            Instant now = Instant.now();
            unread.forEach(m -> m.setReadAt(now));
            messageRepository.saveAll(unread);
        }

        SenderRole callerRole = conversationService.roleOf(conv, currentUserId);
        resetUnreadCounter(conv, callerRole);
        conversationRepository.save(conv);
    }

    public Message uploadAttachment(String conversationId, String userId, String role,
            MultipartFile file) throws IOException {
        Conversation conv = conversationService.getConversation(conversationId, userId, role);

        validateFile(file);
        String storedName = storeFile(file, conversationId);

        Message.AttachmentInfo info = new Message.AttachmentInfo();
        info.setStoredFilename(storedName);
        info.setOriginalFilename(sanitiseFilename(file.getOriginalFilename()));
        info.setContentType(file.getContentType());
        info.setSizeBytes(file.getSize());

        Message msg = new Message();
        msg.setConversationId(conversationId);
        msg.setBookingId(conv.getBookingId());
        msg.setSenderId(userId);
        msg.setSenderRole(role.toUpperCase());
        msg.setType(Message.MessageType.ATTACHMENT);
        msg.setAttachment(info);
        msg.setReadByCustomer("CUSTOMER".equalsIgnoreCase(role));
        msg.setReadByProvider("PROVIDER".equalsIgnoreCase(role));

        Message saved = messageRepository.save(msg);
        conversationService.updateLastMessage(conversationId, "📎 " + info.getOriginalFilename(), role);
        return saved;
    }

    public Path getAttachmentPath(String messageId, String userId, String role) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        if (msg.getAttachment() == null) {
            throw new ResourceNotFoundException("No attachment on this message.");
        }

        conversationService.getConversation(msg.getConversationId(), userId, role);

        Path filePath = Paths.get(attachmentsDir,
                msg.getConversationId(),
                msg.getAttachment().getStoredFilename());

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Attachment file not found.");
        }
        return filePath;
    }

    public String getAttachmentContentType(String messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getContentType() : "application/octet-stream";
    }

    public String getAttachmentOriginalName(String messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getOriginalFilename() : "file";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAttachmentException("No file provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidAttachmentException("File too large. Maximum allowed size is 10 MB.");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct)) {
            throw new InvalidAttachmentException("Unsupported file type.");
        }
        String name = file.getOriginalFilename();
        if (name != null && (name.contains("..") || name.contains("/") || name.contains("\\"))) {
            throw new InvalidAttachmentException("Invalid filename.");
        }
    }

    private String storeFile(MultipartFile file, String conversationId) throws IOException {
        Path dir = Paths.get(attachmentsDir, conversationId);
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String storedName = UUID.randomUUID() + ext;
        Path dest = dir.resolve(storedName);
        file.transferTo(dest.toFile());
        return storedName;
    }

    private String sanitiseFilename(String filename) {
        if (filename == null)
            return "file";
        return filename.replaceAll("[/\\\\:*?\"<>|]", "_")
                .replaceAll("\\.\\.", "_")
                .trim();
    }

    private void incrementRecipientUnread(Conversation conv, SenderRole senderRole) {
        if (senderRole == SenderRole.CUSTOMER) {
            conv.setProviderUnread(conv.getProviderUnread() + 1);
        } else {
            conv.setCustomerUnread(conv.getCustomerUnread() + 1);
        }
    }

    private void resetUnreadCounter(Conversation conv, SenderRole callerRole) {
        if (callerRole == SenderRole.CUSTOMER) {
            conv.setCustomerUnread(0);
        } else {
            conv.setProviderUnread(0);
        }
    }

    private String truncatePreview(String content) {
        if (content == null || content.length() <= PREVIEW_MAX_LENGTH) {
            return content;
        }
        return content.substring(0, PREVIEW_MAX_LENGTH - 3) + "...";
    }

    private MessageResponse toResponse(Message message) {
        SenderRole roleEnum = SenderRole.CUSTOMER;
        if (message.getSenderRole() != null) {
            try {
                roleEnum = SenderRole.valueOf(message.getSenderRole());
            } catch (Exception ignored) {
            }
        }

        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                roleEnum,
                message.getContent(),
                message.getReadAt(),
                message.getCreatedAt());
    }

    private void publishMessageReceivedEvent(Conversation conv,
            String senderId,
            SenderRole senderRole,
            String content) {
        String recipientId = senderRole == SenderRole.CUSTOMER
                ? conv.getProviderId()
                : conv.getCustomerId();

        String preview = content != null && content.length() > 60 ? content.substring(0, 57) + "..." : content;
        log.debug("Notification stub: MESSAGE_RECEIVED to recipientId={}, conversationId={}, preview={}",
                recipientId, conv.getId(), preview);
    }

    MessageRepository getMessageRepository() {
        return messageRepository;
    }
}