package com.clickcart.service;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import com.clickcart.dto.ReviewEligibilityResponse;
import com.clickcart.repository.ReviewRepository;

@Service
public class MongoReviewEligibilityGateway
        implements ReviewEligibilityGateway {

    private static final String PROVIDER_JOBS_COLLECTION =
            "provider_jobs";

    private final MongoTemplate mongoTemplate;
    private final ReviewRepository reviewRepository;

    public MongoReviewEligibilityGateway(
            MongoTemplate mongoTemplate,
            ReviewRepository reviewRepository
    ) {
        this.mongoTemplate = mongoTemplate;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public Optional<ReviewEligibilityResponse>
    findEligibleBookingForCustomer(String customerId) {

        if (customerId == null || customerId.isBlank()) {
            return Optional.empty();
        }

        Query query = new Query(
                Criteria.where("customerId")
                        .is(customerId)
                        .and("status")
                        .is("COMPLETED")
        );

        query.with(
                Sort.by(
                        Sort.Direction.DESC,
                        "completedAt"
                )
        );

        List<Document> jobs = mongoTemplate.find(
                query,
                Document.class,
                PROVIDER_JOBS_COLLECTION
        );

        for (Document job : jobs) {
            String bookingId = resolveBookingId(job);

            if (bookingId == null) {
                continue;
            }

            if (!reviewRepository.existsByBookingId(bookingId)) {
                return Optional.of(toResponse(job, bookingId));
            }
        }

        return Optional.empty();
    }

    @Override
    public ReviewEligibilityResponse requireEligibleBooking(
            String bookingId,
            String customerId
    ) {

        if (bookingId == null || bookingId.isBlank()) {
            throw new IllegalArgumentException(
                    "Booking ID is required"
            );
        }

        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException(
                    "Customer ID is required"
            );
        }

        Query query = new Query(
            new Criteria().andOperator(
                Criteria.where("customerId")
                    .is(customerId),

                Criteria.where("status")
                    .is("COMPLETED"),

                new Criteria().orOperator(
                    Criteria.where("bookingCode")
                        .is(bookingId),

                    Criteria.where("_id")
                        .is(bookingId)
                )
            )
        );

        Document job = mongoTemplate.findOne(
                query,
                Document.class,
                PROVIDER_JOBS_COLLECTION
        );

        if (job == null) {
            throw new IllegalArgumentException(
                    "Completed booking is not eligible for review"
            );
        }

        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new IllegalStateException(
                    "A review already exists for this booking"
            );
        }

        return toResponse(job, bookingId);
    }

    private ReviewEligibilityResponse toResponse(
            Document job,
            String bookingId
    ) {

        return new ReviewEligibilityResponse(
                bookingId,
                stringValue(job, "providerId"),
                stringValue(job, "providerName"),
                stringValue(job, "serviceId"),
                firstNonBlank(
                        stringValue(job, "serviceTitle"),
                        stringValue(job, "serviceName")
                ),
                instantValue(job.get("completedAt")),
                true
        );
    }

    private String resolveBookingId(Document job) {

        String bookingCode =
                stringValue(job, "bookingCode");

        if (bookingCode != null) {
            return bookingCode;
        }

        Object id = job.get("_id");

        return id == null ? null : id.toString();
    }

    private String stringValue(
            Document document,
            String field
    ) {

        Object value = document.get(field);

        if (value == null) {
            return null;
        }

        String result = value.toString().trim();

        return result.isEmpty()
                ? null
                : result;
    }

    private String firstNonBlank(
            String first,
            String second
    ) {

        if (first != null && !first.isBlank()) {
            return first;
        }

        return second;
    }

    private Instant instantValue(Object value) {

        if (value instanceof Instant instant) {
            return instant;
        }

        if (value instanceof Date date) {
            return date.toInstant();
        }

        if (value instanceof String text) {
            try {
                return Instant.parse(text);
            } catch (Exception ignored) {
                return null;
            }
        }

        return null;
    }
}