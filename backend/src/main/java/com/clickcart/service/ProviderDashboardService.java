package com.clickcart.service;

import com.clickcart.dto.provider.*;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.model.Review;
import com.clickcart.repository.ProviderJobRepository;
import com.clickcart.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProviderDashboardService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Colombo");

    private final ProviderJobRepository jobRepository;
    private final ReviewRepository reviewRepository;

    public ProviderDashboardService(ProviderJobRepository jobRepository, ReviewRepository reviewRepository) {
        this.jobRepository = jobRepository;
        this.reviewRepository = reviewRepository;
    }

    public ProviderDashboardResponse getDashboardData(String providerId, String displayName, String range) {
        // Provider ID and display name are now passed from the controller
        // No need to use ProviderContext anymore
        List<ProviderJob> allJobs = jobRepository.findByProviderIdOrderByScheduledStartAsc(providerId);
        List<Review> allReviews = reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId);

        // 1. Profile
        String greeting = getGreeting(displayName);
        ProviderProfileDto profile = new ProviderProfileDto(
                providerId,
                displayName,
                "Service Provider",
                null, // Avatar not loaded for dashboard to avoid cross-module dependency
                true,
                true,
                greeting,
                "Here's how your business is performing today.",
                0 // Profile completion managed elsewhere
        );

        // 2. Booking Performance
        long placed = 0, accepted = 0, inProgress = 0, completed = 0;
        for (ProviderJob job : allJobs) {
            if (job.getStatus() == JobStatus.PLACED) placed++;
            else if (job.getStatus() == JobStatus.ACCEPTED) accepted++;
            else if (job.getStatus() == JobStatus.IN_PROGRESS) inProgress++;
            else if (job.getStatus() == JobStatus.COMPLETED) completed++;
        }
        long totalJobs = placed + accepted + inProgress + completed;
        BookingPerformanceDto bookingPerformance = new BookingPerformanceDto(
                (int) placed, (int) accepted, (int) completed, (int) inProgress, (int) totalJobs,
                new BookingPerformanceDto.StatusPercentages(
                        pct(placed, totalJobs), pct(accepted, totalJobs), pct(completed, totalJobs), pct(inProgress, totalJobs)
                )
        );

        // 3. Performance Summary
        double totalEarnings = allJobs.stream()
                .filter(j -> j.getStatus() == JobStatus.COMPLETED && j.getNetPayout() != null)
                .mapToDouble(ProviderJob::getNetPayout)
                .sum();
        
        double avgRating = allReviews.stream()
                .mapToInt(Review::getRating)
                .average().orElse(0.0);

        PerformanceSummaryDto summary = new PerformanceSummaryDto(
                new PerformanceSummaryDto.EarningMetric(totalEarnings, "LKR " + String.format("%,.0f", totalEarnings), 0.0, "up", "lifetime"),
                new PerformanceSummaryDto.JobMetric((int) completed, 0.0, "up", "lifetime"),
                new PerformanceSummaryDto.RatingMetric(Math.round(avgRating * 10.0) / 10.0, 5.0, allReviews.size()),
                new PerformanceSummaryDto.CompletionRateMetric(totalJobs > 0 ? ((double) completed / totalJobs) * 100 : 0, 0.0, "up", "lifetime")
        );

        // 4. Today's Schedule
        LocalDate today = ZonedDateTime.now(ZONE).toLocalDate();
        List<ScheduleItemDto> schedule = allJobs.stream()
                .filter(j -> j.getStatus() != JobStatus.COMPLETED && j.getScheduledStart() != null)
                .filter(j -> ZonedDateTime.ofInstant(j.getScheduledStart(), ZONE).toLocalDate().equals(today))
                .map(j -> new ScheduleItemDto(
                        j.getId(),
                        formatTime(j.getScheduledStart()),
                        j.getServiceTitle() != null ? j.getServiceTitle() : "Service",
                        j.getCustomerName() != null ? j.getCustomerName() : "Client",
                        j.getCity() != null ? j.getCity() : (j.getAddress() != null ? j.getAddress() : "Location"),
                        j.getStatus() == JobStatus.IN_PROGRESS ? "Active" : "Upcoming"
                ))
                .collect(Collectors.toList());

        // 5. Recent Activity
        List<ProviderJob> sortedByUpdated = new ArrayList<>(allJobs);
        sortedByUpdated.sort(Comparator.comparing(ProviderJob::getUpdatedAt).reversed());
        List<RecentActivityDto> activity = sortedByUpdated.stream().limit(4).map(j -> {
            String type = j.getStatus() == JobStatus.COMPLETED ? "job_completed" : "booking_accepted";
            String title = j.getStatus() == JobStatus.COMPLETED ? "Job Completed" : (j.getStatus() == JobStatus.IN_PROGRESS ? "Job Started" : "Booking Accepted");
            String subtitle = j.getServiceTitle() != null ? j.getServiceTitle() : "Service";
            String code = j.getPublicCode() != null ? "#" + j.getPublicCode() : "";
            String time = formatTimeAgo(j.getUpdatedAt());
            String icon = j.getStatus() == JobStatus.COMPLETED ? "check" : (j.getStatus() == JobStatus.IN_PROGRESS ? "play" : "calendar");
            return new RecentActivityDto(j.getId(), type, title, subtitle, code, time, icon);
        }).collect(Collectors.toList());

        // 6. Service Performance
        Map<String, List<ProviderJob>> jobsByService = allJobs.stream()
                .filter(j -> j.getStatus() == JobStatus.COMPLETED && j.getServiceTitle() != null)
                .collect(Collectors.groupingBy(ProviderJob::getServiceTitle));
        
        List<ServicePerformanceDto> servicePerformance = new ArrayList<>();
        int rank = 1;
        for (Map.Entry<String, List<ProviderJob>> entry : jobsByService.entrySet()) {
            double sEarnings = entry.getValue().stream().filter(j -> j.getNetPayout() != null).mapToDouble(ProviderJob::getNetPayout).sum();
            servicePerformance.add(new ServicePerformanceDto(
                    "SVC-" + rank, rank, entry.getKey(), entry.getValue().size(), sEarnings, "LKR " + String.format("%,.0f", sEarnings), 0.0, 0, null
            ));
            rank++;
        }
        servicePerformance.sort(Comparator.comparing(ServicePerformanceDto::getRevenue).reversed());

        // 7. Chart Data (real data from database)
        Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> chartData = buildChartData(allJobs, allReviews);
        PerformanceOverviewDto overview = new PerformanceOverviewDto(
                "Your performance overview",
                chartData
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

    private double pct(long count, long total) {
        return total > 0 ? ((double) count / total) * 100 : 0.0;
    }

    private String getGreeting(String name) {
        int hour = ZonedDateTime.now(ZONE).getHour();
        String timeOfDay = "evening";
        if (hour < 12) timeOfDay = "morning";
        else if (hour < 17) timeOfDay = "afternoon";
        return "Good " + timeOfDay + ", " + (name != null ? name : "Provider");
    }

    private String formatTime(Instant instant) {
        if (instant == null) return "";
        return ZonedDateTime.ofInstant(instant, ZONE).format(DateTimeFormatter.ofPattern("hh:mm a"));
    }

    private String formatTimeAgo(Instant instant) {
        if (instant == null) return "";
        long minutes = ChronoUnit.MINUTES.between(instant, Instant.now());
        if (minutes < 60) return minutes + " mins ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hours ago";
        return (hours / 24) + " days ago";
    }

    private Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> buildChartData(List<ProviderJob> allJobs, List<Review> allReviews) {
        Map<String, Map<String, PerformanceOverviewDto.MetricSeries>> ranges = new LinkedHashMap<>();

        // 7 Days calculation
        List<String> labels7d = new ArrayList<>();
        List<Double> earnings7d = new ArrayList<>();
        List<Double> jobs7d = new ArrayList<>();
        List<Double> ratings7d = new ArrayList<>();
        
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            labels7d.add(day.format(DateTimeFormatter.ofPattern("MMM d")));
            
            List<ProviderJob> dayJobs = allJobs.stream()
                .filter(j -> j.getStatus() == JobStatus.COMPLETED && j.getCompletedAt() != null)
                .filter(j -> ZonedDateTime.ofInstant(j.getCompletedAt(), ZONE).toLocalDate().equals(day.toLocalDate()))
                .collect(Collectors.toList());
            
            double dEarnings = dayJobs.stream().filter(j -> j.getNetPayout() != null).mapToDouble(ProviderJob::getNetPayout).sum();
            earnings7d.add(dEarnings);
            jobs7d.add((double) dayJobs.size());
            
            // Calculate average rating for this day from reviews
            LocalDate dayLocal = day.toLocalDate();
            double dayRating = allReviews.stream()
                .filter(r -> r.getCreatedAt() != null)
                .filter(r -> ZonedDateTime.ofInstant(r.getCreatedAt(), ZONE).toLocalDate().equals(dayLocal))
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            ratings7d.add(dayRating);
        }

        double maxEarning = earnings7d.stream().max(Double::compareTo).orElse(0.0);
        double maxJob = jobs7d.stream().max(Double::compareTo).orElse(0.0);
        
        List<String> eYAxis = Arrays.asList("LKR " + (int)maxEarning, "LKR " + (int)(maxEarning*0.8), "LKR " + (int)(maxEarning*0.6), "LKR " + (int)(maxEarning*0.4), "LKR " + (int)(maxEarning*0.2), "LKR 0");
        List<String> jYAxis = Arrays.asList(String.valueOf((int)maxJob), String.valueOf((int)(maxJob*0.8)), String.valueOf((int)(maxJob*0.6)), String.valueOf((int)(maxJob*0.4)), String.valueOf((int)(maxJob*0.2)), "0");

        Map<String, PerformanceOverviewDto.MetricSeries> sevenDays = new LinkedHashMap<>();
        sevenDays.put("earnings", new PerformanceOverviewDto.MetricSeries(
                eYAxis, maxEarning > 0 ? maxEarning : 1.0, labels7d, earnings7d, "LKR "
        ));
        sevenDays.put("jobs", new PerformanceOverviewDto.MetricSeries(
                jYAxis, maxJob > 0 ? maxJob : 1.0, labels7d, jobs7d, " jobs"
        ));
        sevenDays.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"), 5.0, labels7d, ratings7d, " / 5"
        ));
        ranges.put("7d", sevenDays);

        // 30 Days calculation
        List<String> labels30d = new ArrayList<>();
        List<Double> earnings30d = new ArrayList<>();
        List<Double> jobs30d = new ArrayList<>();
        List<Double> ratings30d = new ArrayList<>();

        for (int i = 29; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            labels30d.add(day.format(DateTimeFormatter.ofPattern("MMM d")));

            List<ProviderJob> dayJobs = allJobs.stream()
                .filter(j -> j.getStatus() == JobStatus.COMPLETED && j.getCompletedAt() != null)
                .filter(j -> ZonedDateTime.ofInstant(j.getCompletedAt(), ZONE).toLocalDate().equals(day.toLocalDate()))
                .collect(Collectors.toList());

            double dEarnings = dayJobs.stream().filter(j -> j.getNetPayout() != null).mapToDouble(ProviderJob::getNetPayout).sum();
            earnings30d.add(dEarnings);
            jobs30d.add((double) dayJobs.size());

            LocalDate dayLocal = day.toLocalDate();
            double dayRating = allReviews.stream()
                .filter(r -> r.getCreatedAt() != null)
                .filter(r -> ZonedDateTime.ofInstant(r.getCreatedAt(), ZONE).toLocalDate().equals(dayLocal))
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            ratings30d.add(dayRating);
        }

        double maxEarning30d = earnings30d.stream().max(Double::compareTo).orElse(0.0);
        double maxJob30d = jobs30d.stream().max(Double::compareTo).orElse(0.0);

        List<String> eYAxis30d = Arrays.asList("LKR " + (int)maxEarning30d, "LKR " + (int)(maxEarning30d*0.8), "LKR " + (int)(maxEarning30d*0.6), "LKR " + (int)(maxEarning30d*0.4), "LKR " + (int)(maxEarning30d*0.2), "LKR 0");
        List<String> jYAxis30d = Arrays.asList(String.valueOf((int)maxJob30d), String.valueOf((int)(maxJob30d*0.8)), String.valueOf((int)(maxJob30d*0.6)), String.valueOf((int)(maxJob30d*0.4)), String.valueOf((int)(maxJob30d*0.2)), "0");

        Map<String, PerformanceOverviewDto.MetricSeries> thirtyDays = new LinkedHashMap<>();
        thirtyDays.put("earnings", new PerformanceOverviewDto.MetricSeries(
                eYAxis30d, maxEarning30d > 0 ? maxEarning30d : 1.0, labels30d, earnings30d, "LKR "
        ));
        thirtyDays.put("jobs", new PerformanceOverviewDto.MetricSeries(
                jYAxis30d, maxJob30d > 0 ? maxJob30d : 1.0, labels30d, jobs30d, " jobs"
        ));
        thirtyDays.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"), 5.0, labels30d, ratings30d, " / 5"
        ));
        ranges.put("30d", thirtyDays);

        // 6 Months calculation (weekly aggregates)
        List<String> labels6m = new ArrayList<>();
        List<Double> earnings6m = new ArrayList<>();
        List<Double> jobs6m = new ArrayList<>();
        List<Double> ratings6m = new ArrayList<>();

        for (int i = 23; i >= 0; i--) {
            ZonedDateTime weekStart = now.minusWeeks(i);
            labels6m.add(weekStart.format(DateTimeFormatter.ofPattern("MMM d")));

            ZonedDateTime weekEnd = weekStart.plusDays(7);
            List<ProviderJob> weekJobs = allJobs.stream()
                .filter(j -> j.getStatus() == JobStatus.COMPLETED && j.getCompletedAt() != null)
                .filter(j -> {
                    ZonedDateTime completed = ZonedDateTime.ofInstant(j.getCompletedAt(), ZONE);
                    return !completed.isBefore(weekStart) && completed.isBefore(weekEnd);
                })
                .collect(Collectors.toList());

            double wEarnings = weekJobs.stream().filter(j -> j.getNetPayout() != null).mapToDouble(ProviderJob::getNetPayout).sum();
            earnings6m.add(wEarnings);
            jobs6m.add((double) weekJobs.size());

            double weekRating = allReviews.stream()
                .filter(r -> r.getCreatedAt() != null)
                .filter(r -> {
                    ZonedDateTime created = ZonedDateTime.ofInstant(r.getCreatedAt(), ZONE);
                    return !created.isBefore(weekStart) && created.isBefore(weekEnd);
                })
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            ratings6m.add(weekRating);
        }

        double maxEarning6m = earnings6m.stream().max(Double::compareTo).orElse(0.0);
        double maxJob6m = jobs6m.stream().max(Double::compareTo).orElse(0.0);

        List<String> eYAxis6m = Arrays.asList("LKR " + (int)maxEarning6m, "LKR " + (int)(maxEarning6m*0.8), "LKR " + (int)(maxEarning6m*0.6), "LKR " + (int)(maxEarning6m*0.4), "LKR " + (int)(maxEarning6m*0.2), "LKR 0");
        List<String> jYAxis6m = Arrays.asList(String.valueOf((int)maxJob6m), String.valueOf((int)(maxJob6m*0.8)), String.valueOf((int)(maxJob6m*0.6)), String.valueOf((int)(maxJob6m*0.4)), String.valueOf((int)(maxJob6m*0.2)), "0");

        Map<String, PerformanceOverviewDto.MetricSeries> sixMonths = new LinkedHashMap<>();
        sixMonths.put("earnings", new PerformanceOverviewDto.MetricSeries(
                eYAxis6m, maxEarning6m > 0 ? maxEarning6m : 1.0, labels6m, earnings6m, "LKR "
        ));
        sixMonths.put("jobs", new PerformanceOverviewDto.MetricSeries(
                jYAxis6m, maxJob6m > 0 ? maxJob6m : 1.0, labels6m, jobs6m, " jobs"
        ));
        sixMonths.put("rating", new PerformanceOverviewDto.MetricSeries(
                Arrays.asList("5.0", "4.0", "3.0", "2.0", "1.0", "0.0"), 5.0, labels6m, ratings6m, " / 5"
        ));
        ranges.put("6m", sixMonths);

        return ranges;
    }
}
