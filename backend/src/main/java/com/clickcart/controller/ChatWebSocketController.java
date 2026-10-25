package com.clickcart.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.SendMessageRequest;
import com.clickcart.model.Conversation;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.service.MessageService;

@Controller
public class ChatWebSocketController {

    private final MessageService messageService;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageService messageService,
                                   ConversationRepository conversationRepository,
                                   SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.conversationRepository = conversationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable String conversationId,
            Principal principal,
            @Payload SendMessageRequest request) {
            
        if (principal == null) {
            throw new IllegalArgumentException("Not authenticated");
        }
        
        String currentUserId = principal.getName();
        
        // This persists, updates conversation metadata, triggers notifications, and throws if not a participant
        MessageResponse response = messageService.sendMessage(conversationId, currentUserId, request);
        
        // Broadcast the new message to all participants listening to this conversation
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, response);
        
        // Server also pushes unread-count update to recipient
        Conversation conv = conversationRepository.findById(conversationId).orElse(null);
        if (conv != null) {
            boolean isCustomer = currentUserId.equals(conv.getCustomerId());
            String recipientId = isCustomer ? conv.getProviderId() : conv.getCustomerId();
            int unreadCount = isCustomer ? conv.getProviderUnread() : conv.getCustomerUnread();
            
            messagingTemplate.convertAndSendToUser(
                    recipientId,
                    "/queue/unread",
                    new UnreadCountUpdate(conversationId, unreadCount)
            );
        }
    }

    @MessageMapping("/conversations/{conversationId}/read")
    public void markAsRead(
            @DestinationVariable String conversationId,
            Principal principal) {
            
        if (principal == null) {
            throw new IllegalArgumentException("Not authenticated");
        }
        
        String currentUserId = principal.getName();
        
        messageService.markAsRead(conversationId, currentUserId);
        
        // Push updated unread count to sender. The sender's unread count is now 0.
        messagingTemplate.convertAndSendToUser(
                currentUserId,
                "/queue/unread",
                new UnreadCountUpdate(conversationId, 0)
        );
    }
    
    public static class UnreadCountUpdate {
        private String conversationId;
        private int unreadCount;
        
        public UnreadCountUpdate(String conversationId, int unreadCount) {
            this.conversationId = conversationId;
            this.unreadCount = unreadCount;
        }
        
        public String getConversationId() { return conversationId; }
        public void setConversationId(String conversationId) { this.conversationId = conversationId; }
        public int getUnreadCount() { return unreadCount; }
        public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    }
}
