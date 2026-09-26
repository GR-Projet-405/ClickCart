package com.clickcart.service;

import com.clickcart.dto.provider.BookingPerformanceDto;
import com.clickcart.dto.provider.PerformanceOverviewDto;
import com.clickcart.dto.provider.PerformanceSummaryDto;
import com.clickcart.dto.provider.ProviderDashboardResponse;
import com.clickcart.dto.provider.ProviderProfileDto;
import com.clickcart.dto.provider.RecentActivityDto;
import com.clickcart.dto.provider.ScheduleItemDto;
import com.clickcart.dto.provider.ServicePerformanceDto;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProviderDashboardService {

    public ProviderDashboardResponse getDashboardData(String providerId, String range, String metric) {
        ProviderProfileDto profile = new ProviderProfileDto(
                providerId != null ? providerId : "PROV-1002",
                "Kamal Perera",
                "Service Provider",
                "/assets/avatar-kamal.jpg",
                true,
                true,
                "Good morning, Kamal",
                "Here's how your business is performing today.",
                92
        );

        PerformanceSummaryDto summary = new PerformanceSummaryDto(
                new PerformanceSummaryDto.EarningMetric(125680.0, "LKR 125,680", 12.0, "up", "vs last month"),
                new PerformanceSummaryDto.JobMetric(24, 8.0, "up", "vs last month"),
                new PerformanceSummaryDto.RatingMetric(4.9, 5.0, 120),
                new PerformanceSummaryDto.CompletionRateMetric(96.0, 4.0, "up", "vs last month")
        );

        Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> chartData = buildChartData();
        PerformanceOverviewDto overview = new PerformanceOverviewDto(
                "You're performing better than last month",
                chartData
        );

        BookingPerformanceDto bookingPerformance = new BookingPerformanceDto(
                5,
                8,
                24,
                1,
                38,
                new BookingPerformanceDto.StatusPercentages(12.0, 20.0, 64.0, 4.0)
        );

        List<RecentActivityDto> activity = Arrays.asList(
                new RecentActivityDto("ACT-01", "booking_accepted", "Booking Accepted", "AC Repair & Service", "#BK-0047", "2 hours ago", "calendar"),
                new RecentActivityDto("ACT-02", "job_completed", "Job Completed", "Home Cleaning", "#BK-0043", "4 hours ago", "check"),
                new RecentActivityDto("ACT-03", "payment_received", "Payment Received", "LKR 6,800", "#BK-0041", "6 hours ago", "payment"),
                new RecentActivityDto("ACT-04", "review_received", "Review Received", "5 stars • Home Cleaning", "#BK-0039", "8 hours ago", "star")
        );

        List<ServicePerformanceDto> servicePerformance = Arrays.asList(
                new ServicePerformanceDto("SVC-01", 1, "AC Repair & Service", 12, 48600.0, "LKR 48,600", 4.9, 48, "/assets/service-ac-repair.jpg"),
                new ServicePerformanceDto("SVC-02", 2, "Home Cleaning", 8, 32400.0, "LKR 32,400", 4.8, 32, "/assets/service-cleaning.jpg"),
                new ServicePerformanceDto("SVC-03", 3, "Plumbing", 6, 24680.0, "LKR 24,680", 4.7, 24, "/assets/service-plumbing.jpg")
        );

        List<ScheduleItemDto> schedule = Arrays.asList(
                new ScheduleItemDto("SCH-01", "09:00 AM", "AC Repair & Service", "Nimal Perera", "Gampaha", "Upcoming"),
                new ScheduleItemDto("SCH-02", "02:00 PM", "Home Cleaning", "Saman Kumara", "Kandy", "Upcoming"),
                new ScheduleItemDto("SCH-03", "05:30 PM", "Plumbing", "Kasun Silva", "Kurunegala", "Upcoming")
        );

        return new ProviderDashboardResponse(
                profile,
                summary,
                overview,
                bookingPerformance,
                activity,
                servicePerformance,
                schedule
        );
    }

    private Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> buildChartData() {
        Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> ranges = new LinkedHashMap<>();

        Map<String, PerformanceOverviewDto.MetricSeries> sevenDays = new LinkedHashMap<>();
        sevenDays.put("earnings", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("LKR 25,000", "LKR 20,000", "LKR 15,000", "LKR 10,000", "LKR 5,000", "LKR 0"),
                25000.0,
                Arrays.asList("Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"),
                Arrays.asList(6200.0, 10400.0, 11200.0, 13800.0, 16900.0, 21400.0, 18600.0),
                "LKR "
        ));
        sevenDays.put("jobs", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("10", "8", "6", "4", "2", "0"),
                10.0,
                Arrays.asList("Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"),
                Arrays.asList(2.0, 3.0, 4.0, 3.0, 5.0, 6.0, 4.0),
                " jobs"
        ));
        sevenDays.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"),
                5.0,
                Arrays.asList("Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"),
                Arrays.asList(4.7, 4.8, 4.9, 4.8, 4.9, 5.0, 4.9),
                " / 5"
        ));
        ranges.put("7d", sevenDays);

        Map<String, PerformanceOverviewDto.MetricSeries> thirtyDays = new LinkedHashMap<>();
        thirtyDays.put("earnings", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("LKR 50,000", "LKR 40,000", "LKR 30,000", "LKR 20,000", "LKR 10,000", "LKR 0"),
                50000.0,
                Arrays.asList("Week 1", "Week 2", "Week 3", "Week 4"),
                Arrays.asList(26500.0, 31200.0, 38400.0, 29580.0),
                "LKR "
        ));
        thirtyDays.put("jobs", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("15", "12", "9", "6", "3", "0"),
                15.0,
                Arrays.asList("Week 1", "Week 2", "Week 3", "Week 4"),
                Arrays.asList(5.0, 6.0, 8.0, 5.0),
                " jobs"
        ));
        thirtyDays.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"),
                5.0,
                Arrays.asList("Week 1", "Week 2", "Week 3", "Week 4"),
                Arrays.asList(4.8, 4.9, 4.9, 5.0),
                " / 5"
        ));
        ranges.put("30d", thirtyDays);

        Map<String, PerformanceOverviewDto.MetricSeries> sixMonths = new LinkedHashMap<>();
        sixMonths.put("earnings", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("LKR 150,000", "LKR 120,000", "LKR 90,000", "LKR 60,000", "LKR 30,000", "LKR 0"),
                150000.0,
                Arrays.asList("Apr", "May", "Jun", "Jul", "Aug", "Sep"),
                Arrays.asList(74000.0, 86500.0, 99200.0, 112000.0, 118400.0, 125680.0),
                "LKR "
        ));
        sixMonths.put("jobs", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("30", "24", "18", "12", "6", "0"),
                30.0,
                Arrays.asList("Apr", "May", "Jun", "Jul", "Aug", "Sep"),
                Arrays.asList(14.0, 16.0, 19.0, 21.0, 22.0, 24.0),
                " jobs"
        ));
        sixMonths.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"),
                5.0,
                Arrays.asList("Apr", "May", "Jun", "Jul", "Aug", "Sep"),
                Arrays.asList(4.6, 4.7, 4.8, 4.8, 4.9, 4.9),
                " / 5"
        ));
        ranges.put("6m", sixMonths);

        return ranges;
    }
}
