package com.clickcart.service;

import com.clickcart.model.*;
import com.clickcart.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;

/** Connects accepted marketplace bookings to the provider's existing job console. */
@Service
public class BookingWorkflowService {
    private final ProviderJobRepository jobs;
    private final BookingRepository bookings;
    public BookingWorkflowService(ProviderJobRepository jobs, BookingRepository bookings) { this.jobs=jobs; this.bookings=bookings; }
    public void ensureJob(Booking b) {
        String id="booking-"+b.getId();
        if (jobs.existsById(id)) return;
        ProviderJob job=new ProviderJob();
        job.setId(id); job.setBookingCode(b.getId()); job.setPublicCode("BK-"+b.getId());
        job.setProviderId(b.getProviderId()); job.setCustomerId(b.getCustomerId());
        job.setCustomerName(b.getCustomerName()); job.setCustomerPhone(b.getCustomerPhone());
        job.setServiceId(b.getServiceId()); job.setProviderName(b.getProviderName());
        job.setServiceTitle(b.getServiceTitle()); job.setServiceCategory(b.getServiceCategory());
        job.setAddress(b.getAddress()); job.setCity(b.getLocation()); job.setAccessInstructions(b.getNotes());
        job.setScheduledStart(b.getScheduledAt()); job.setScheduledEnd(b.getScheduledAt().plusSeconds(3600));
        job.setServiceBaseFee(b.getTotalCost()); job.setPartsTopUp(0.0);
        job.setStatus(JobStatus.ACCEPTED); job.setPaymentHold("CASH_DUE");
        job.setProgressLabel("Accepted by provider"); job.setProgressPercent(40);
        job.setPlacedAt(b.getCreatedAt()); job.setAcceptedAt(Instant.now()); job.setCreatedAt(Instant.now()); job.setUpdatedAt(Instant.now());
        jobs.save(job);
    }
    public void requireActiveBooking(ProviderJob job) {
        bookings.findById(job.getBookingCode()).ifPresent(b -> {
            if (b.getStatus()==BookingStatus.CANCELLED || b.getStatus()==BookingStatus.DECLINED)
                throw new IllegalArgumentException("This booking has been cancelled or declined");
        });
    }
    public void updateBooking(ProviderJob job, BookingStatus status, String label) {
        bookings.findById(job.getBookingCode()).ifPresent(b -> {
            if (!b.getProviderId().equals(job.getProviderId())) throw new IllegalArgumentException("Booking provider mismatch");
            b.setStatus(status); b.setStatusLabel(label); b.setUpdatedAt(Instant.now()); bookings.save(b);
        });
    }
}
