package com.clickcart.dto;

import java.util.Map;

public class RatingSummaryResponse {

    private double averageRating;
    private long totalReviews;
    private Map<Integer, Long> distribution;

    public RatingSummaryResponse() {
    }

    public RatingSummaryResponse(
            double averageRating,
            long totalReviews,
            Map<Integer, Long> distribution
    ) {
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.distribution = distribution;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Map<Integer, Long> getDistribution() {
        return distribution;
    }

    public void setDistribution(Map<Integer, Long> distribution) {
        this.distribution = distribution;
    }
}