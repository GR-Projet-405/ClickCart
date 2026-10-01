package com.clickcart.repository;

import com.clickcart.model.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /** All messages for a conversation, oldest first. (Legacy List) */
    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    /** Paginated messages for a conversation, oldest first. */
    Slice<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    /**
     * Legacy: Count unread messages for a given conversation by role using boolean
     * flags.
     */
    long countByConversationIdAndReadByCustomerFalseAndSenderRoleNot(
            String conversationId, String senderRole);

    long countByConversationIdAndReadByProviderFalseAndSenderRoleNot(
            String conversationId, String senderRole);

    /** New: Returns all unread messages in a conversation sent by someone else. */
    @Query("{ 'conversationId': ?0, 'senderId': { '$ne': ?1 }, 'readAt': { '$exists': false } }")
    List<Message> findUnreadMessagesForRecipient(String conversationId, String senderId);

    /**
     * New: Counts unread messages in a conversation sent by someone else using
     * readAt null marker.
     */
    long countByConversationIdAndReadAtIsNullAndSenderIdNot(String conversationId, String senderId);
}