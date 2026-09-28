import { API_BASE_URL } from "../config/api";
import kamalAvatar from "../assets/avatar-kamal.jpg";
import acRepairImg from "../assets/service-ac-repair.jpg";
import cleaningImg from "../assets/service-cleaning.jpg";
import plumbingImg from "../assets/service-plumbing.jpg";

export const MOCK_DASHBOARD_DATA = {
  provider: {
    id: "PROV-1002",
    name: "Kamal Perera",
    role: "Service Provider",
    avatar: kamalAvatar,
    verified: true,
    online: true,
    greeting: "Good morning, Kamal",
    subtitle: "Here's how your business is performing today.",
    profileCompletion: 92,
  },
  performanceSummary: {
    totalEarnings: {
      amount: 125680,
      formatted: "LKR 125,680",
      changePercent: 12,
      trend: "up",
      periodLabel: "vs last month",
    },
    jobsCompleted: {
      count: 24,
      changePercent: 8,
      trend: "up",
      periodLabel: "vs last month",
    },
    averageRating: {
      score: 4.9,
      maxScore: 5,
      reviewCount: 120,
    },
    completionRate: {
      rate: 96,
      changePercent: 4,
      trend: "up",
      periodLabel: "vs last month",
    },
  },
  performanceOverview: {
    note: "You're performing better than last month",
    chartData: {
      "7d": {
        earnings: {
          yAxis: ["LKR 25,000", "LKR 20,000", "LKR 15,000", "LKR 10,000", "LKR 5,000", "LKR 0"],
          max: 25000,
          labels: ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"],
          values: [6200, 10400, 11200, 13800, 16900, 21400, 18600],
          unit: "LKR ",
        },
        jobs: {
          yAxis: ["10", "8", "6", "4", "2", "0"],
          max: 10,
          labels: ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"],
          values: [2, 3, 4, 3, 5, 6, 4],
          unit: " jobs",
        },
        rating: {
          yAxis: ["5.0", "4.0", "3.0", "2.0", "1.0", "0.0"],
          max: 5,
          labels: ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7"],
          values: [4.7, 4.8, 4.9, 4.8, 4.9, 5.0, 4.9],
          unit: " / 5",
        },
      },
      "30d": {
        earnings: {
          yAxis: ["LKR 50,000", "LKR 40,000", "LKR 30,000", "LKR 20,000", "LKR 10,000", "LKR 0"],
          max: 50000,
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          values: [26500, 31200, 38400, 29580],
          unit: "LKR ",
        },
        jobs: {
          yAxis: ["15", "12", "9", "6", "3", "0"],
          max: 15,
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          values: [5, 6, 8, 5],
          unit: " jobs",
        },
        rating: {
          yAxis: ["5.0", "4.0", "3.0", "2.0", "1.0", "0.0"],
          max: 5,
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          values: [4.8, 4.9, 4.9, 5.0],
          unit: " / 5",
        },
      },
      "6m": {
        earnings: {
          yAxis: ["LKR 150,000", "LKR 120,000", "LKR 90,000", "LKR 60,000", "LKR 30,000", "LKR 0"],
          max: 150000,
          labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
          values: [74000, 86500, 99200, 112000, 118400, 125680],
          unit: "LKR ",
        },
        jobs: {
          yAxis: ["30", "24", "18", "12", "6", "0"],
          max: 30,
          labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
          values: [14, 16, 19, 21, 22, 24],
          unit: " jobs",
        },
        rating: {
          yAxis: ["5.0", "4.0", "3.0", "2.0", "1.0", "0.0"],
          max: 5,
          labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
          values: [4.6, 4.7, 4.8, 4.8, 4.9, 4.9],
          unit: " / 5",
        },
      },
    },
  },
  bookingPerformance: {
    pending: 5,
    confirmed: 8,
    completed: 24,
    cancelled: 1,
    total: 38,
    percentages: {
      pending: 12,
      confirmed: 20,
      completed: 64,
      cancelled: 4,
    },
  },
  recentActivity: [
    {
      id: "ACT-01",
      type: "booking_accepted",
      title: "Booking Accepted",
      service: "AC Repair & Service",
      code: "#BK-0047",
      timeAgo: "2 hours ago",
      iconType: "calendar",
    },
    {
      id: "ACT-02",
      type: "job_completed",
      title: "Job Completed",
      service: "Home Cleaning",
      code: "#BK-0043",
      timeAgo: "4 hours ago",
      iconType: "check",
    },
    {
      id: "ACT-03",
      type: "payment_received",
      title: "Payment Received",
      service: "LKR 6,800",
      code: "#BK-0041",
      timeAgo: "6 hours ago",
      iconType: "payment",
    },
    {
      id: "ACT-04",
      type: "review_received",
      title: "Review Received",
      service: "5 stars • Home Cleaning",
      code: "#BK-0039",
      timeAgo: "8 hours ago",
      iconType: "star",
    },
  ],
  servicePerformance: [
    {
      id: "SVC-01",
      rank: 1,
      title: "AC Repair & Service",
      bookings: 12,
      revenue: 48600,
      revenueFormatted: "LKR 48,600",
      rating: 4.9,
      reviewsCount: 48,
      image: acRepairImg,
    },
    {
      id: "SVC-02",
      rank: 2,
      title: "Home Cleaning",
      bookings: 8,
      revenue: 32400,
      revenueFormatted: "LKR 32,400",
      rating: 4.8,
      reviewsCount: 32,
      image: cleaningImg,
    },
    {
      id: "SVC-03",
      rank: 3,
      title: "Plumbing",
      bookings: 6,
      revenue: 24680,
      revenueFormatted: "LKR 24,680",
      rating: 4.7,
      reviewsCount: 24,
      image: plumbingImg,
    },
  ],
  todaySchedule: [
    {
      id: "SCH-01",
      time: "09:00 AM",
      service: "AC Repair & Service",
      customer: "Nimal Perera",
      location: "Gampaha",
      status: "Upcoming",
    },
    {
      id: "SCH-02",
      time: "02:00 PM",
      service: "Home Cleaning",
      customer: "Saman Kumara",
      location: "Kandy",
      status: "Upcoming",
    },
    {
      id: "SCH-03",
      time: "05:30 PM",
      service: "Plumbing",
      customer: "Kasun Silva",
      location: "Kurunegala",
      status: "Upcoming",
    },
  ],
};

const serviceImageMap = {
  "SVC-01": acRepairImg,
  "SVC-02": cleaningImg,
  "SVC-03": plumbingImg,
};

export async function fetchProviderDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/provider/dashboard`, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      console.warn("Backend API responded with non-200. Falling back to local data.", response.status);
      return MOCK_DASHBOARD_DATA;
    }
    const data = await response.json();
    const servicePerformance = (data.servicePerformance || MOCK_DASHBOARD_DATA.servicePerformance).map(
      (item) => ({
        ...item,
        image: serviceImageMap[item.id] || item.image || acRepairImg,
      })
    );
    return {
      ...MOCK_DASHBOARD_DATA,
      ...data,
      provider: {
        ...MOCK_DASHBOARD_DATA.provider,
        ...data.provider,
        avatar: kamalAvatar,
      },
      servicePerformance,
      performanceSummary: { ...MOCK_DASHBOARD_DATA.performanceSummary, ...data.performanceSummary },
      bookingPerformance: { ...MOCK_DASHBOARD_DATA.bookingPerformance, ...data.bookingPerformance },
    };
  } catch (error) {
    console.info("Using local provider dashboard dataset (API offline):", error.message);
    return MOCK_DASHBOARD_DATA;
  }
}
