package com.clickcart.service;

import com.clickcart.dto.SendMessageRequest;
import com.clickcart.exception.AccessDeniedException;
import com.clickcart.exception.InvalidAttachmentException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.Message;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

@Service
public class MessageService {

    // ── Configuration ─────────────────────────────────────────────────────────

    /** Directory where attachments are stored on disk. NOT web-accessible by path. */
    @Value("${clickcart.attachments.dir:${java.io.tmpdir}/clickcart-attachments}")
    private String attachmentsDir;

    /** Max file size in bytes: 10 MB. */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L;

    /** Allowed MIME types for attachments. */
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private final MessageRepository messageRepo;
    private final ConversationRepository conversationRepo;
    private final ConversationService conversationService;

    public MessageService(MessageRepository messageRepo,
                          ConversationRepository conversationRepo,
                          ConversationService conversationService) {
        this.messageRepo = messageRepo;
        this.conversationRepo = conversationRepo;
        this.conversationService = conversationService;
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * Fetches all messages for a conversation after verifying the caller has access.
     */
    public List<Message> getMessages(String conversationId, String userId, String role) {
        // Verify access
        conversationService.getConversation(conversationId, userId, role);
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    // ── Send text message ─────────────────────────────────────────────────────

    public Message sendMessage(SendMessageRequest req, String userId, String role) {
        // Verify caller belongs to this conversation
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

        Message saved = messageRepo.save(msg);

        // Update conversation preview
        String preview = req.getContent() != null
                ? req.getContent().substring(0, Math.min(req.getContent().length(), 80))
                : "[message]";
        conversationService.updateLastMessage(req.getConversationId(), preview, role);

        return saved;
    }

    // ── Upload attachment ─────────────────────────────────────────────────────

    public Message uploadAttachment(String conversationId, String userId, String role,
                                    MultipartFile file) throws IOException {
        // Verify access
        Conversation conv = conversationService.getConversation(conversationId, userId, role);

        // Validate file
        validateFile(file);

        // Sanitise and store file
        String storedName = storeFile(file, conversationId);

        // Build the attachment message
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

        Message saved = messageRepo.save(msg);
        conversationService.updateLastMessage(conversationId, "📎 " + info.getOriginalFilename(), role);
        return saved;
    }

    // ── Download attachment ───────────────────────────────────────────────────

    public Path getAttachmentPath(String messageId, String userId, String role) {
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        if (msg.getAttachment() == null) {
            throw new ResourceNotFoundException("No attachment on this message.");
        }

        // Verify access to the parent conversation
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
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getContentType() : "application/octet-stream";
    }

    public String getAttachmentOriginalName(String messageId) {
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getOriginalFilename() : "file";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAttachmentException("No file provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidAttachmentException(
                    "File too large. Maximum allowed size is 10 MB.");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct)) {
            throw new InvalidAttachmentException(
                    "Unsupported file type. Allowed types: images (JPEG, PNG, GIF, WebP), PDF, DOC, DOCX, TXT.");
        }
        String name = file.getOriginalFilename();
        if (name != null && (name.contains("..") || name.contains("/") || name.contains("\\"))) {
            throw new InvalidAttachmentException("Invalid filename.");
        }
    }

    private String storeFile(MultipartFile file, String conversationId) throws IOException {
        // Each conversation gets its own sub-directory — never expose raw paths
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
        if (filename == null) return "file";
        // Strip path separators and control characters
        return filename.replaceAll("[/\\\\:*?\"<>|]", "_")
                       .replaceAll("\\.\\.", "_")
                       .trim();
    }
}
