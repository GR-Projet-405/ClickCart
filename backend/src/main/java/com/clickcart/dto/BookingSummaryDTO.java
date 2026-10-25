package com.clickcart.dto;

public class BookingSummaryDTO {
    private long upcomingCount;
    private long activeCount;
    private long historyCount;
    private long totalCount;

    public BookingSummaryDTO() {
    }

    public BookingSummaryDTO(long upcomingCount, long activeCount, long historyCount, long totalCount) {
        this.upcomingCount = upcomingCount;
        this.activeCount = activeCount;
        this.historyCount = historyCount;
        this.totalCount = totalCount;
    }

    public long getUpcomingCount() {
        return upcomingCount;
    }

    public void setUpcomingCount(long upcomingCount) {
        this.upcomingCount = upcomingCount;
    }

    public long getActiveCount() {
        return activeCount;
    }

    public void setActiveCount(long activeCount) {
        this.activeCount = activeCount;
    }

    public long getHistoryCount() {
        return historyCount;
    }

    public void setHistoryCount(long historyCount) {
        this.historyCount = historyCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
}
