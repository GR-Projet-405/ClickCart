package com.clickcart.repository;

import com.clickcart.model.BookingEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingEventRepository extends MongoRepository<BookingEvent, String> {

    /** All events for a booking/conversation, in chronological order. */
    List<BookingEvent> findByConversationIdOrderByOccurredAtAsc(String conversationId);

    List<BookingEvent> findByBookingIdOrderByOccurredAtAsc(String bookingId);
}
