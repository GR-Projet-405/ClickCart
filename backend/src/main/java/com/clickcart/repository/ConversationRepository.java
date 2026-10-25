package com.clickcart.repository;

import com.clickcart.model.Conversation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    /**
     * All conversations where this user is the customer, newest last-message first.
     * (Legacy List)
     */
    List<Conversation> findByCustomerIdOrderByLastMessageAtDesc(String customerId);

    /** All conversations where this user is the provider. (Legacy List) */
    List<Conversation> findByProviderIdOrderByLastMessageAtDesc(String providerId);

    /** Paginated versions for new messaging feature. */
    Slice<Conversation> findByCustomerIdOrderByLastMessageAtDesc(String customerId, Pageable pageable);

    Slice<Conversation> findByProviderIdOrderByLastMessageAtDesc(String providerId, Pageable pageable);

    /** Look up by bookingId (should be unique). */
    Optional<Conversation> findByBookingId(String bookingId);

    /** Check ownership before allowing access. */
    Optional<Conversation> findByIdAndCustomerId(String id, String customerId);

    Optional<Conversation> findByIdAndProviderId(String id, String providerId);

    /**
     * Looks up the single conversation shared by a specific customer–provider pair.
     */
    Optional<Conversation> findByCustomerIdAndProviderId(String customerId, String providerId);
}