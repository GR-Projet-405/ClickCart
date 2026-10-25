package com.clickcart.service;

import com.clickcart.model.BookingEvent;
import com.clickcart.repository.BookingEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingEventService {

    private final BookingEventRepository eventRepo;

    public BookingEventService(BookingEventRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    /** Return all events for a conversation timeline. */
    public List<BookingEvent> getEventsForConversation(String conversationId) {
        return eventRepo.findByConversationIdOrderByOccurredAtAsc(conversationId);
    }

    /** Seed initial booking events when a conversation is first created. */
    public void seedInitialEvents(String bookingId, String conversationId, String bookingStatus) {
        List<BookingEvent> events = List.of(
            new BookingEvent(bookingId, conversationId, "CONFIRMED",
                    "Booking Confirmed", null, "done"),
            new BookingEvent(bookingId, conversationId, "PROVIDER_ASSIGNED",
                    "Provider Assigned", null, "done"),
            new BookingEvent(bookingId, conversationId, "SCHEDULED",
                    "Service Scheduled", null,
                    isAtOrPast(bookingStatus, "SCHEDULED") ? "done" : "pending"),
            new BookingEvent(bookingId, conversationId, "IN_PROGRESS",
                    "Service In Progress", null,
                    isAtOrPast(bookingStatus, "IN_PROGRESS") ? "active" : "pending"),
            new BookingEvent(bookingId, conversationId, "COMPLETED",
                    "Service Completed", null,
                    isAtOrPast(bookingStatus, "COMPLETED") ? "done" : "pending")
        );
        eventRepo.saveAll(events);
    }

    /** Publish a new single event into a conversation's timeline. */
    public BookingEvent publishEvent(String bookingId, String conversationId,
                                     String eventType, String label,
                                     String description, String state) {
        BookingEvent event = new BookingEvent(bookingId, conversationId, eventType,
                label, description, state);
        return eventRepo.save(event);
    }

    private boolean isAtOrPast(String current, String target) {
        List<String> order = List.of("CONFIRMED", "PROVIDER_ASSIGNED", "SCHEDULED",
                                     "IN_PROGRESS", "COMPLETED");
        int ci = order.indexOf(current.toUpperCase());
        int ti = order.indexOf(target.toUpperCase());
        return ci >= ti && ci >= 0;
    }
}
