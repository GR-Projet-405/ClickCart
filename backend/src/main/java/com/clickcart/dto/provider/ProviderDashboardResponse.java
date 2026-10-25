package com.clickcart.dto.provider;

import java.util.List;

public class ProviderDashboardResponse {
    private ProviderProfileDto provider;
    private PerformanceSummaryDto performanceSummary;
    private PerformanceOverviewDto performanceOverview;
    private BookingPerformanceDto bookingPerformance;
    private List<RecentActivityDto> recentActivity;
    private List<ServicePerformanceDto> servicePerformance;
    private List<ScheduleItemDto> todaySchedule;

    public ProviderDashboardResponse() {}

    public ProviderDashboardResponse(
            ProviderProfileDto provider,
            PerformanceSummaryDto performanceSummary,
            PerformanceOverviewDto performanceOverview,
            BookingPerformanceDto bookingPerformance,
            List<RecentActivityDto> recentActivity,
            List<ServicePerformanceDto> servicePerformance,
            List<ScheduleItemDto> todaySchedule
    ) {
        this.provider = provider;
        this.performanceSummary = performanceSummary;
        this.performanceOverview = performanceOverview;
        this.bookingPerformance = bookingPerformance;
        this.recentActivity = recentActivity;
        this.servicePerformance = servicePerformance;
        this.todaySchedule = todaySchedule;
    }

    public ProviderProfileDto getProvider() { return provider; }
    public void setProvider(ProviderProfileDto provider) { this.provider = provider; }

    public PerformanceSummaryDto getPerformanceSummary() { return performanceSummary; }
    public void setPerformanceSummary(PerformanceSummaryDto performanceSummary) { this.performanceSummary = performanceSummary; }

    public PerformanceOverviewDto getPerformanceOverview() { return performanceOverview; }
    public void setPerformanceOverview(PerformanceOverviewDto performanceOverview) { this.performanceOverview = performanceOverview; }

    public BookingPerformanceDto getBookingPerformance() { return bookingPerformance; }
    public void setBookingPerformance(BookingPerformanceDto bookingPerformance) { this.bookingPerformance = bookingPerformance; }

    public List<RecentActivityDto> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<RecentActivityDto> recentActivity) { this.recentActivity = recentActivity; }

    public List<ServicePerformanceDto> getServicePerformance() { return servicePerformance; }
    public void setServicePerformance(List<ServicePerformanceDto> servicePerformance) { this.servicePerformance = servicePerformance; }

    public List<ScheduleItemDto> getTodaySchedule() { return todaySchedule; }
    public void setTodaySchedule(List<ScheduleItemDto> todaySchedule) { this.todaySchedule = todaySchedule; }
}
