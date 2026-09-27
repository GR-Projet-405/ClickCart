package com.clickcart.dto.provider;

public class PerformanceSummaryDto {

    public static class EarningMetric {
        private double amount;
        private String formatted;
        private double changePercent;
        private String trend;
        private String periodLabel;

        public EarningMetric() {}
        public EarningMetric(double amount, String formatted, double changePercent, String trend, String periodLabel) {
            this.amount = amount;
            this.formatted = formatted;
            this.changePercent = changePercent;
            this.trend = trend;
            this.periodLabel = periodLabel;
        }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getFormatted() { return formatted; }
        public void setFormatted(String formatted) { this.formatted = formatted; }
        public double getChangePercent() { return changePercent; }
        public void setChangePercent(double changePercent) { this.changePercent = changePercent; }
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        public String getPeriodLabel() { return periodLabel; }
        public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }
    }

    public static class JobMetric {
        private int count;
        private double changePercent;
        private String trend;
        private String periodLabel;

        public JobMetric() {}
        public JobMetric(int count, double changePercent, String trend, String periodLabel) {
            this.count = count;
            this.changePercent = changePercent;
            this.trend = trend;
            this.periodLabel = periodLabel;
        }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        public double getChangePercent() { return changePercent; }
        public void setChangePercent(double changePercent) { this.changePercent = changePercent; }
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        public String getPeriodLabel() { return periodLabel; }
        public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }
    }

    public static class RatingMetric {
        private double score;
        private double maxScore;
        private int reviewCount;

        public RatingMetric() {}
        public RatingMetric(double score, double maxScore, int reviewCount) {
            this.score = score;
            this.maxScore = maxScore;
            this.reviewCount = reviewCount;
        }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public double getMaxScore() { return maxScore; }
        public void setMaxScore(double maxScore) { this.maxScore = maxScore; }
        public int getReviewCount() { return reviewCount; }
        public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    }

    public static class CompletionRateMetric {
        private double rate;
        private double changePercent;
        private String trend;
        private String periodLabel;

        public CompletionRateMetric() {}
        public CompletionRateMetric(double rate, double changePercent, String trend, String periodLabel) {
            this.rate = rate;
            this.changePercent = changePercent;
            this.trend = trend;
            this.periodLabel = periodLabel;
        }
        public double getRate() { return rate; }
        public void setRate(double rate) { this.rate = rate; }
        public double getChangePercent() { return changePercent; }
        public void setChangePercent(double changePercent) { this.changePercent = changePercent; }
        public String getTrend() { return trend; }
        public void setTrend(String trend) { this.trend = trend; }
        public String getPeriodLabel() { return periodLabel; }
        public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }
    }

    private EarningMetric totalEarnings;
    private JobMetric jobsCompleted;
    private RatingMetric averageRating;
    private CompletionRateMetric completionRate;

    public PerformanceSummaryDto() {}

    public PerformanceSummaryDto(EarningMetric totalEarnings, JobMetric jobsCompleted, RatingMetric averageRating, CompletionRateMetric completionRate) {
        this.totalEarnings = totalEarnings;
        this.jobsCompleted = jobsCompleted;
        this.averageRating = averageRating;
        this.completionRate = completionRate;
    }

    public EarningMetric getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(EarningMetric totalEarnings) { this.totalEarnings = totalEarnings; }

    public JobMetric getJobsCompleted() { return jobsCompleted; }
    public void setJobsCompleted(JobMetric jobsCompleted) { this.jobsCompleted = jobsCompleted; }

    public RatingMetric getAverageRating() { return averageRating; }
    public void setAverageRating(RatingMetric averageRating) { this.averageRating = averageRating; }

    public CompletionRateMetric getCompletionRate() { return completionRate; }
    public void setCompletionRate(CompletionRateMetric completionRate) { this.completionRate = completionRate; }
}
