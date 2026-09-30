package com.clickcart.controller;

import com.clickcart.dto.SendMessageRequest;
import com.clickcart.model.Message;
import com.clickcart.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

/**
 * REST endpoints for messages and attachments inside a conversation.
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * GET /api/messages?conversationId=&userId=&role=
     * Return all messages for a conversation (oldest first).
     */
    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
            @RequestParam String conversationId,
            @RequestParam String userId,
            @RequestParam String role) {
        List<Message> messages = messageService.getMessages(conversationId, userId, role);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/messages
     * Send a text or system-event message.
     */
    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @Valid @RequestBody SendMessageRequest req,
            @RequestParam String userId,
            @RequestParam String role) {
        Message msg = messageService.sendMessage(req, userId, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    /**
     * POST /api/messages/attachments?conversationId=&userId=&role=
     * Upload a file attachment tied to a specific booking conversation.
     * The file is validated and stored server-side; only UUID-based names are used.
     */
    @PostMapping("/attachments")
    public ResponseEntity<Message> uploadAttachment(
            @RequestParam String conversationId,
            @RequestParam String userId,
            @RequestParam String role,
            @RequestParam("file") MultipartFile file) throws IOException {
        Message msg = messageService.uploadAttachment(conversationId, userId, role, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    /**
     * GET /api/messages/{messageId}/attachment?userId=&role=
     * Securely download an attachment — verifies the caller owns the booking.
     * Returns the file with Content-Disposition: attachment to trigger a download.
     */
    @GetMapping("/{messageId}/attachment")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String messageId,
            @RequestParam String userId,
            @RequestParam String role) throws IOException {
        Path filePath = messageService.getAttachmentPath(messageId, userId, role);
        String contentType = messageService.getAttachmentContentType(messageId);
        String originalName = messageService.getAttachmentOriginalName(messageId);

        Resource resource = new PathResource(filePath);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(originalName)
                                .build()
                                .toString())
                .body(resource);
    }
}
