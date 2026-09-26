package com.clickcart.dto.provider;

public class BookingPerformanceDto {

    public static class StatusPercentages {
        private double pending;
        private double confirmed;
        private double completed;
        private double cancelled;

        public StatusPercentages() {}
        public StatusPercentages(double pending, double confirmed, double completed, double cancelled) {
            this.pending = pending;
            this.confirmed = confirmed;
            this.completed = completed;
            this.cancelled = cancelled;
        }

        public double getPending() { return pending; }
        public void setPending(double pending) { this.pending = pending; }
        public double getConfirmed() { return confirmed; }
        public void setConfirmed(double confirmed) { this.confirmed = confirmed; }
        public double getCompleted() { return completed; }
        public void setCompleted(double completed) { this.completed = completed; }
        public double getCancelled() { return cancelled; }
        public void setCancelled(double cancelled) { this.cancelled = cancelled; }
    }

    private int pending;
    private int confirmed;
    private int completed;
    private int cancelled;
    private int total;
    private StatusPercentages percentages;

    public BookingPerformanceDto() {}

    public BookingPerformanceDto(int pending, int confirmed, int completed, int cancelled, int total, StatusPercentages percentages) {
        this.pending = pending;
        this.confirmed = confirmed;
        this.completed = completed;
        this.cancelled = cancelled;
        this.total = total;
        this.percentages = percentages;
    }

    public int getPending() { return pending; }
    public void setPending(int pending) { this.pending = pending; }

    public int getConfirmed() { return confirmed; }
    public void setConfirmed(int confirmed) { this.confirmed = confirmed; }

    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }

    public int getCancelled() { return cancelled; }
    public void setCancelled(int cancelled) { this.cancelled = cancelled; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public StatusPercentages getPercentages() { return percentages; }
    public void setPercentages(StatusPercentages percentages) { this.percentages = percentages; }
}
