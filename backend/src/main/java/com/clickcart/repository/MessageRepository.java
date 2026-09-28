package com.clickcart.repository;

import com.clickcart.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /** All messages for a conversation, oldest first. */
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    /** Count unread messages for a given conversation by role. */
    long countByConversationIdAndReadByCustomerFalseAndSenderRoleNot(
            String conversationId, String senderRole);

    long countByConversationIdAndReadByProviderFalseAndSenderRoleNot(
            String conversationId, String senderRole);
}
