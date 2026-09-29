package com.clickcart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.clickcart.dto.BookingCreateDTO;
import com.clickcart.dto.BookingDTO;
import com.clickcart.dto.BookingResponse;
import com.clickcart.dto.BookingSummaryDTO;
import com.clickcart.dto.CreateBookingRequest;
import com.clickcart.exception.BookingException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Booking;
import com.clickcart.model.BookingStatus;
import com.clickcart.repository.BookingRepository;

import jakarta.annotation.PostConstruct;

@Service
public class BookingServiceImpl implements BookingService {

    private static final String TEMPORARY_CUSTOMER_ID = "DEV-18_PENDING_CUSTOMER";

    private static final Set<LocalTime> SUPPORTED_TIME_SLOTS = Set.of(
            LocalTime.of(9, 0),
            LocalTime.of(11, 0),
            LocalTime.of(14, 0),
            LocalTime.of(16, 0));

    private final BookingRepository bookingRepository;

    @Autowired
    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostConstruct
    public void initSeedData() {
        try {
            if (bookingRepository.count() == 0) {
                seedInitialData();
            }
        } catch (Exception e) {
            // Log or ignore if DB connection unavailable during startup
        }
    }

    private void seedInitialData() {
        Instant now = Instant.now();

        List<Booking> mockBookings = Arrays.asList(
                new Booking("bk-101", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-1", "AC Repair & Service", "Appliance Repair",
                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
                        "prv-1", "Kamal Perera", "", 4.9, 120,
                        "16 Sep 2026", "10:00 AM - 11:30 AM", "Colombo",
                        "No. 45, Galle Road, Colombo 03", 3000.0, "LKR",
                        BookingStatus.UPCOMING, "Confirmed", "Regular maintenance and coil cleaning", now, now),

                new Booking("bk-102", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-2", "House Cleaning", "Cleaning",
                        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
                        "prv-2", "Nisansala Silva", "", 4.8, 95,
                        "20 Sep 2026", "2:00 PM - 4:00 PM", "Colombo",
                        "No. 45, Galle Road, Colombo 03", 2500.0, "LKR",
                        BookingStatus.UPCOMING, "Confirmed", "Deep cleaning for living room and kitchen", now, now),

                new Booking("bk-103", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-3", "Plumbing & Pipe Leak Repair", "Plumbing",
                        "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop",
                        "prv-3", "Ruwan Jayasinghe", "", 4.7, 84,
                        "25 Sep 2026", "11:00 AM - 1:00 PM", "Kandy",
                        "No. 12, Peradeniya Road, Kandy", 4200.0, "LKR",
                        BookingStatus.ACTIVE, "In Progress", "Fix bathroom sink leak and inspect pipes", now, now),

                new Booking("bk-104", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-4", "Sofa & Carpet Deep Cleaning", "Cleaning",
                        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
                        "prv-4", "Nimali Fernando", "", 4.9, 150,
                        "10 Aug 2026", "9:00 AM - 12:00 PM", "Colombo",
                        "No. 45, Galle Road, Colombo 03", 5500.0, "LKR",
                        BookingStatus.COMPLETED, "Completed", "Shampooing 5-seater sofa set and carpet", now, now),

                new Booking("bk-105", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-5", "Electrical Wiring & Socket Repair", "Electrical",
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
                        "prv-5", "Sunil Shantha", "", 4.8, 62,
                        "02 Jul 2026", "3:00 PM - 5:00 PM", "Galle",
                        "No. 8, Beach Road, Galle", 3500.0, "LKR",
                        BookingStatus.COMPLETED, "Completed",
                        "Repaired main distribution box and replaced burnt sockets", now, now),

                new Booking("bk-106", "cust_101", "Tharindu", "tharindu@example.com", "+94771234567",
                        "srv-6", "Lawn Mowing & Garden Care", "Gardening",
                        "https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?q=80&w=600&auto=format&fit=crop",
                        "prv-6", "Kasun Wickramasinghe", "", 4.6, 41,
                        "15 May 2026", "8:00 AM - 10:00 AM", "Negombo",
                        "No. 3, Main Street, Negombo", 2800.0, "LKR",
                        BookingStatus.CANCELLED, "Cancelled", "Cancelled by customer due to heavy rain", now, now));

        bookingRepository.saveAll(mockBookings);
    }

    @Override
    public List<BookingDTO> getCustomerBookings(String customerId, String tab) {
        List<Booking> bookings;

        if (tab == null || tab.trim().isEmpty() || "upcoming".equalsIgnoreCase(tab)) {
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId,
                    Arrays.asList(BookingStatus.UPCOMING, BookingStatus.CONFIRMED));
        } else if ("active".equalsIgnoreCase(tab)) {
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId,
                    Arrays.asList(BookingStatus.ACTIVE, BookingStatus.IN_PROGRESS));
        } else if ("history".equalsIgnoreCase(tab)) {
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId,
                    Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED));
        } else {
            bookings = bookingRepository.findByCustomerId(customerId);
        }

        return bookings.stream()
                .map(BookingDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public BookingSummaryDTO getCustomerBookingSummary(String customerId) {
        long upcoming = bookingRepository.countByCustomerIdAndStatusIn(customerId,
                Arrays.asList(BookingStatus.UPCOMING, BookingStatus.CONFIRMED));
        long active = bookingRepository.countByCustomerIdAndStatusIn(customerId,
                Arrays.asList(BookingStatus.ACTIVE, BookingStatus.IN_PROGRESS));
        long history = bookingRepository.countByCustomerIdAndStatusIn(customerId,
                Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED));
        long total = upcoming + active + history;

        return new BookingSummaryDTO(upcoming, active, history, total);
    }

    @Override
    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return new BookingDTO(booking);
    }

    // ORIGINAL CREATE BOOKING (From HEAD)
    @Override
    public BookingDTO createBooking(BookingCreateDTO createDTO) {
        Instant now = Instant.now();
        Booking booking = new Booking();
        booking.setCustomerId(createDTO.getCustomerId());
        booking.setCustomerName(createDTO.getCustomerName());
        booking.setCustomerEmail(createDTO.getCustomerEmail());
        booking.setCustomerPhone(createDTO.getCustomerPhone());
        booking.setServiceId(createDTO.getServiceId());
        booking.setServiceTitle(createDTO.getServiceTitle());
        booking.setServiceCategory(createDTO.getServiceCategory());
        booking.setImageUrl(createDTO.getImageUrl());
        booking.setProviderId(createDTO.getProviderId());
        booking.setProviderName(createDTO.getProviderName());
        booking.setProviderAvatar(createDTO.getProviderAvatar());
        booking.setProviderRating(createDTO.getProviderRating() != null ? createDTO.getProviderRating() : 5.0);
        booking.setProviderReviewCount(
                createDTO.getProviderReviewCount() != null ? createDTO.getProviderReviewCount() : 1);
        booking.setBookingDate(createDTO.getBookingDate());
        booking.setTimeSlot(createDTO.getTimeSlot());
        booking.setLocation(createDTO.getLocation());
        booking.setAddress(createDTO.getAddress());
        booking.setTotalCost(createDTO.getTotalCost());
        booking.setCurrency(createDTO.getCurrency() != null ? createDTO.getCurrency() : "LKR");
        booking.setStatus(BookingStatus.UPCOMING);
        booking.setStatusLabel("Confirmed");
        booking.setNotes(createDTO.getNotes());
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);

        Booking saved = bookingRepository.save(booking);
        return new BookingDTO(saved);
    }

    // DEV-16: BOOKING CREATION (From dev)
    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        validateRequest(request);

        Booking.PriceSnapshot priceSnapshot = new Booking.PriceSnapshot(
                request.getServiceFee(),
                request.getMaterialsCost(),
                request.getTravelCost(),
                request.getPlatformFee());

        Booking booking = new Booking();
        booking.setCustomerId(TEMPORARY_CUSTOMER_ID);
        booking.setServiceId(request.getServiceId());
        booking.setProviderId(request.getProviderId());
        booking.setServiceAddressId(request.getServiceAddressId());
        booking.setServiceTitle(request.getServiceTitle());
        booking.setBookingLocalDate(request.getBookingDate()); // using the LocalDate setter
        booking.setStartTime(request.getStartTime());
        booking.setAdditionalDetails(request.getAdditionalDetails());
        booking.setContactFullName(request.getContactFullName());
        booking.setContactPhone(request.getContactPhone());
        booking.setContactEmail(request.getContactEmail());
        booking.setPreferredContactMethod(request.getPreferredContactMethod());
        booking.setPriceSnapshot(priceSnapshot);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        booking.setCreatedAt(Instant.now());

        Booking savedBooking = bookingRepository.save(booking);

        return BookingResponse.from(savedBooking);
    }

    private void validateRequest(CreateBookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request must not be null");
        }

        LocalDate bookingDate = request.getBookingDate();
        if (bookingDate == null || bookingDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }

        LocalTime startTime = request.getStartTime();
        if (startTime == null || !SUPPORTED_TIME_SLOTS.contains(startTime)) {
            throw new IllegalArgumentException("Start time must be a supported booking time slot");
        }
    }

    @Override
    public BookingDTO cancelBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setStatusLabel("Cancelled");
        if (reason != null && !reason.trim().isEmpty()) {
            booking.setNotes(
                    (booking.getNotes() != null ? booking.getNotes() + " | " : "") + "Cancellation reason: " + reason);
        }
        booking.setUpdatedAt(Instant.now());

        Booking updated = bookingRepository.save(booking);
        return new BookingDTO(updated);
    }

    @Override
    public List<BookingResponse> listPending(String providerId, String sort) {
        List<Booking> found;
        if (sort == null || "newest".equals(sort)) {
            found = bookingRepository.findByProviderIdAndStatusOrderByCreatedAtDesc(
                    providerId, BookingStatus.PENDING_APPROVAL);
        } else if ("oldest".equals(sort)) {
            found = bookingRepository.findByProviderIdAndStatusOrderByCreatedAtAsc(
                    providerId, BookingStatus.PENDING_APPROVAL);
        } else {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Sort must be newest or oldest");
        }
        return found.stream().map(this::toResponse).toList();
    }

    @Override
    public BookingResponse get(String bookingId, String providerId) {
        return toResponse(requireOwned(bookingId, providerId));
    }

    @Override
    public BookingResponse decide(String bookingId, String providerId, BookingStatus nextStatus) {
        if (nextStatus != BookingStatus.ACCEPTED && nextStatus != BookingStatus.DECLINED) {
            throw new BookingException(HttpStatus.BAD_REQUEST, "Choose ACCEPTED or DECLINED");
        }
        Booking booking = requireOwned(bookingId, providerId);
        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new BookingException(
                    HttpStatus.CONFLICT,
                    "Only a pending booking can be accepted or declined");
        }
        booking.setStatus(nextStatus);
        booking.setUnread(false);
        booking.setUpdatedAt(Instant.now());
        return toResponse(bookingRepository.save(booking));
    }

    private Booking requireOwned(String bookingId, String providerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (providerId == null || !providerId.equals(booking.getProviderId())) {
            throw new BookingException(
                    HttpStatus.FORBIDDEN,
                    "This booking is assigned to another provider");
        }
        return booking;
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setServiceName(
                booking.getServiceName() != null ? booking.getServiceName() : booking.getServiceTitle());
        response.setCustomerName(booking.getCustomerName());
        response.setCity(booking.getCity() != null ? booking.getCity() : booking.getLocation());
        response.setCountry(booking.getCountry());
        response.setScheduledAt(booking.getScheduledAt());
        response.setTimeSlot(booking.getTimeSlot());
        response.setEstimatedPay(booking.getEstimatedPay());
        response.setCurrency(booking.getCurrency());
        response.setNotes(booking.getNotes());
        response.setStatus(booking.getStatus());
        response.setUnread(booking.isUnread());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}