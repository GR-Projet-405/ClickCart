package com.clickcart.dto.provider;

public class ServicePerformanceDto {
    private String id;
    private int rank;
    private String title;
    private int bookings;
    private double revenue;
    private String revenueFormatted;
    private double rating;
    private int reviewsCount;
    private String image;

    public ServicePerformanceDto() {}

    public ServicePerformanceDto(String id, int rank, String title, int bookings, double revenue, String revenueFormatted, double rating, int reviewsCount, String image) {
        this.id = id;
        this.rank = rank;
        this.title = title;
        this.bookings = bookings;
        this.revenue = revenue;
        this.revenueFormatted = revenueFormatted;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.image = image;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getBookings() { return bookings; }
    public void setBookings(int bookings) { this.bookings = bookings; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }

    public String getRevenueFormatted() { return revenueFormatted; }
    public void setRevenueFormatted(String revenueFormatted) { this.revenueFormatted = revenueFormatted; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
