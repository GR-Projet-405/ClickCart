import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  MessageSquare,
  Plus,
  Star,
  TrendingUp,
  Trophy,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import {
  fetchProviderDashboard,
  MOCK_DASHBOARD_DATA,
} from "../../services/providerDashboardService";
import kamalAvatar from "../../assets/avatar-kamal.jpg";
import acRepairImg from "../../assets/service-ac-repair.jpg";
import cleaningImg from "../../assets/service-cleaning.jpg";
import plumbingImg from "../../assets/service-plumbing.jpg";
import "./ProviderDashboard.css";

const serviceImageMap = {
  "SVC-01": acRepairImg,
  "SVC-02": cleaningImg,
  "SVC-03": plumbingImg,
};

// Helper to compute smooth cubic spline path for SVG
function getSmoothCurvePath(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return path;
}

export default function ProviderDashboard() {
  const [dashboardData, setDashboardData] = useState(MOCK_DASHBOARD_DATA);
  const [timeRange, setTimeRange] = useState("7d"); // "7d" | "30d" | "6m"
  const [activeMetric, setActiveMetric] = useState("earnings"); // "earnings" | "jobs" | "rating"
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const gradientId = useId();

  useEffect(() => {
    let isMounted = true;
    fetchProviderDashboard().then((data) => {
      if (isMounted && data) {
        setDashboardData(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    provider,
    performanceSummary,
    performanceOverview,
    bookingPerformance,
    recentActivity,
    servicePerformance,
    todaySchedule,
  } = dashboardData;

  // Chart data calculations
  const currentChartConfig =
    performanceOverview.chartData?.[timeRange]?.[activeMetric] ||
    performanceOverview.chartData["7d"].earnings;

  const yLabels = currentChartConfig.yAxis;
  const xLabels = currentChartConfig.labels;
  const values = currentChartConfig.values;
  const maxValue = currentChartConfig.max;
  const unit = currentChartConfig.unit || "";

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 220;
  const padLeft = 85;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const points = values.map((val, idx) => {
    const x = padLeft + (idx / (values.length - 1)) * chartW;
    const norm = Math.max(0, Math.min(1, val / maxValue));
    const y = padTop + (1 - norm) * chartH;
    return { x, y, value: val, label: xLabels[idx] };
  });

  const curvePath = getSmoothCurvePath(points);
  const areaPath = points.length
    ? `${curvePath} L ${points[points.length - 1].x},${padTop + chartH} L ${points[0].x},${padTop + chartH} Z`
    : "";

  return (
    <div className="cc-provider-dashboard">
      <h1 className="cc-dashboard-title">Dashboard</h1>

      {/* Welcome Card */}
      <section className="cc-welcome-card" aria-label="Welcome and profile status">
        <div className="cc-welcome-card__copy">
          <h1>{provider.greeting}</h1>
          <p>{provider.subtitle}</p>
        </div>

        <div className="cc-welcome-card__profile">
          <img
            src={provider.avatar || kamalAvatar}
            alt={provider.name}
            className="cc-profile-avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = kamalAvatar;
            }}
          />
          <div className="cc-profile-meta">
            <div className="cc-profile-progress-header">
              <span>
                Profile • <strong>{provider.profileCompletion}% complete</strong>
              </span>
              <button
                className="cc-arrow-btn"
                type="button"
                aria-label="View profile completeness details"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div
              className="cc-profile-bar-track"
              role="progressbar"
              aria-valuenow={provider.profileCompletion}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="cc-profile-bar-fill"
                style={{ width: `${provider.profileCompletion}%` }}
              />
            </div>
            <div className="cc-profile-actions">
              <span className="cc-verified-badge">
                <CheckCircle2 size={16} fill="#10b926" color="#ffffff" />
                Verified Provider
              </span>
              <Link to="/provider/profile" style={{ textDecoration: "none" }}>
                <button className="cc-complete-btn" type="button">
                  Complete Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Summary */}
      <section aria-label="Performance Summary">
        <div className="cc-section-header">
          <h2 className="cc-section-title">Performance Summary</h2>
        </div>
        <div className="cc-kpi-grid">
          {/* Total Earnings */}
          <div className="cc-kpi-card">
            <div className="cc-kpi-icon-wrap cc-kpi-icon-wrap--green">
              <DollarSign size={20} />
            </div>
            <span className="cc-kpi-label">Total Earnings</span>
            <span className="cc-kpi-value">
              {performanceSummary.totalEarnings.formatted}
            </span>
            <div className="cc-kpi-trend">
              <ArrowUpRight size={16} color="#10b926" />
              <strong>+{performanceSummary.totalEarnings.changePercent}%</strong>
              <span>{performanceSummary.totalEarnings.periodLabel}</span>
            </div>
          </div>

          {/* Jobs Completed */}
          <div className="cc-kpi-card">
            <div className="cc-kpi-icon-wrap cc-kpi-icon-wrap--teal">
              <Briefcase size={20} />
            </div>
            <span className="cc-kpi-label">Jobs Completed</span>
            <span className="cc-kpi-value">
              {performanceSummary.jobsCompleted.count}
            </span>
            <div className="cc-kpi-trend">
              <ArrowUpRight size={16} color="#10b926" />
              <strong>+{performanceSummary.jobsCompleted.changePercent}%</strong>
              <span>{performanceSummary.jobsCompleted.periodLabel}</span>
            </div>
          </div>

          {/* Average Rating */}
          <div className="cc-kpi-card">
            <div className="cc-kpi-icon-wrap cc-kpi-icon-wrap--gold">
              <Star size={20} fill="#f5a623" />
            </div>
            <span className="cc-kpi-label">Average Rating</span>
            <span className="cc-kpi-value">
              {performanceSummary.averageRating.score}
              <span style={{ fontSize: "1.125rem", color: "#667085", fontWeight: 500 }}>
                {" "}/ {performanceSummary.averageRating.maxScore}
              </span>
            </span>
            <div className="cc-kpi-reviews">
              <MessageSquare size={14} color="#667085" />
              <span>{performanceSummary.averageRating.reviewCount} reviews</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="cc-kpi-card">
            <div className="cc-kpi-icon-wrap cc-kpi-icon-wrap--green">
              <CheckCircle2 size={20} />
            </div>
            <span className="cc-kpi-label">Completion Rate</span>
            <span className="cc-kpi-value">
              {performanceSummary.completionRate.rate}%
            </span>
            <div className="cc-kpi-trend">
              <ArrowUpRight size={16} color="#10b926" />
              <strong>+{performanceSummary.completionRate.changePercent}%</strong>
              <span>{performanceSummary.completionRate.periodLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Overview Chart */}
      <section className="cc-chart-card" aria-label="Performance Overview">
        <div className="cc-chart-header">
          <div className="cc-chart-header-left">
            <h2 className="cc-section-title">Performance Overview</h2>
            <div className="cc-chart-note">
              <TrendingUp size={16} />
              <span>{performanceOverview.note}</span>
            </div>
          </div>
          <div className="cc-time-pills" role="tablist" aria-label="Select timeframe">
            <button
              className={`cc-time-pill ${timeRange === "7d" ? "cc-time-pill--active" : ""}`}
              onClick={() => setTimeRange("7d")}
              type="button"
            >
              7 Days
            </button>
            <button
              className={`cc-time-pill ${timeRange === "30d" ? "cc-time-pill--active" : ""}`}
              onClick={() => setTimeRange("30d")}
              type="button"
            >
              30 Days
            </button>
            <button
              className={`cc-time-pill ${timeRange === "6m" ? "cc-time-pill--active" : ""}`}
              onClick={() => setTimeRange("6m")}
              type="button"
            >
              6 Months
            </button>
          </div>
        </div>

        {/* Metric Toggles */}
        <div className="cc-metric-pills" role="tablist" aria-label="Select metric">
          <button
            className={`cc-metric-pill ${activeMetric === "earnings" ? "cc-metric-pill--active" : ""}`}
            onClick={() => setActiveMetric("earnings")}
            type="button"
          >
            <TrendingUp size={14} />
            <span>Earnings</span>
          </button>
          <button
            className={`cc-metric-pill ${activeMetric === "jobs" ? "cc-metric-pill--active" : ""}`}
            onClick={() => setActiveMetric("jobs")}
            type="button"
          >
            <Briefcase size={14} />
            <span>Jobs</span>
          </button>
          <button
            className={`cc-metric-pill ${activeMetric === "rating" ? "cc-metric-pill--active" : ""}`}
            onClick={() => setActiveMetric("rating")}
            type="button"
          >
            <Star size={14} />
            <span>Rating</span>
          </button>
        </div>

        {/* SVG Chart */}
        <div className="cc-svg-chart-container">
          <svg
            className="cc-chart-svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b926" stopOpacity="0.28" />
                <stop offset="85%" stopColor="#10b926" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#10b926" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines & Y-labels */}
            {yLabels.map((lbl, idx) => {
              const y = padTop + (idx / (yLabels.length - 1)) * chartH;
              return (
                <g key={lbl}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e4e7ec"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 12}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="500"
                    fill="#667085"
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {/* Curve path */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="#10b926"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points and interaction hit areas */}
            {points.map((pt, idx) => (
              <g key={pt.label}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#10b926"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="18"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* X-axis labels */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="#667085"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Floating Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="cc-chart-tooltip"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / svgHeight) * 100}%`,
              }}
            >
              <div>{points[hoveredIndex].label}</div>
              <div style={{ color: "#10b926", fontWeight: 700 }}>
                {activeMetric === "earnings"
                  ? `${unit}${points[hoveredIndex].value.toLocaleString()}`
                  : `${points[hoveredIndex].value}${unit}`}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2-Column Section */}
      <div className="cc-bottom-grid">
        {/* Left Column */}
        <div className="cc-bottom-col">
          {/* Booking Performance */}
          <div className="cc-content-card" aria-label="Booking Performance">
            <div className="cc-card-top">
              <h2 className="cc-card-heading">
                <Calendar size={18} />
                <span>Booking Performance</span>
              </h2>
              <Link to="/provider/bookings" className="cc-view-all-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {/* 4 Status Boxes */}
            <div className="cc-booking-stat-boxes">
              <div className="cc-booking-stat-box">
                <div className="cc-stat-circle cc-stat-circle--pending">
                  <Clock size={16} />
                </div>
                <span className="cc-stat-box-label">Pending Requests</span>
                <span className="cc-stat-box-count">
                  {bookingPerformance.pending}
                </span>
              </div>
              <div className="cc-booking-stat-box">
                <div className="cc-stat-circle cc-stat-circle--confirmed">
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <span className="cc-stat-box-label">Confirmed</span>
                <span className="cc-stat-box-count">
                  {bookingPerformance.confirmed}
                </span>
              </div>
              <div className="cc-booking-stat-box">
                <div className="cc-stat-circle cc-stat-circle--completed">
                  <CheckCircle2 size={16} />
                </div>
                <span className="cc-stat-box-label">Completed</span>
                <span className="cc-stat-box-count">
                  {bookingPerformance.completed}
                </span>
              </div>
              <div className="cc-booking-stat-box">
                <div className="cc-stat-circle cc-stat-circle--cancelled">
                  <X size={16} strokeWidth={2.5} />
                </div>
                <span className="cc-stat-box-label">Cancelled</span>
                <span className="cc-stat-box-count">
                  {bookingPerformance.cancelled}
                </span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div
              className="cc-segmented-progress-bar"
              role="progressbar"
              aria-label="Booking status distribution"
            >
              <div
                className="cc-segment cc-segment--pending"
                style={{ width: `${bookingPerformance.percentages.pending}%` }}
                title={`Pending: ${bookingPerformance.percentages.pending}%`}
              />
              <div
                className="cc-segment cc-segment--confirmed"
                style={{ width: `${bookingPerformance.percentages.confirmed}%` }}
                title={`Confirmed: ${bookingPerformance.percentages.confirmed}%`}
              />
              <div
                className="cc-segment cc-segment--completed"
                style={{ width: `${bookingPerformance.percentages.completed}%` }}
                title={`Completed: ${bookingPerformance.percentages.completed}%`}
              />
              <div
                className="cc-segment cc-segment--cancelled"
                style={{ width: `${bookingPerformance.percentages.cancelled}%` }}
                title={`Cancelled: ${bookingPerformance.percentages.cancelled}%`}
              />
            </div>

            {/* Legend */}
            <div className="cc-legend-row">
              <span className="cc-legend-item">
                <span className="cc-legend-dot cc-legend-dot--pending" />
                {bookingPerformance.percentages.pending}%
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot cc-legend-dot--confirmed" />
                {bookingPerformance.percentages.confirmed}%
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot cc-legend-dot--completed" />
                {bookingPerformance.percentages.completed}%
              </span>
              <span className="cc-legend-item">
                <span className="cc-legend-dot cc-legend-dot--cancelled" />
                {bookingPerformance.percentages.cancelled}%
              </span>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="cc-content-card" aria-label="Today's Schedule">
            <div className="cc-card-top">
              <h2 className="cc-card-heading">
                <Calendar size={18} />
                <span>Today's Schedule</span>
              </h2>
              <Link to="/provider/calendar" className="cc-view-all-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="cc-schedule-list">
              {todaySchedule.map((item) => (
                <div key={item.id} className="cc-schedule-item">
                  <span className="cc-schedule-time">{item.time}</span>
                  <div className="cc-schedule-info">
                    <span className="cc-schedule-service">{item.service}</span>
                    <span className="cc-schedule-client">
                      {item.customer} • {item.location}
                    </span>
                  </div>
                  <span className="cc-schedule-badge">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="cc-content-card" aria-label="Recent Activity">
            <div className="cc-card-top">
              <h2 className="cc-card-heading">
                <Clock size={18} />
                <span>Recent Activity</span>
              </h2>
              <Link to="/provider/bookings" className="cc-view-all-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="cc-activity-timeline">
              {recentActivity.map((item) => (
                <div key={item.id} className="cc-activity-item">
                  <div className="cc-activity-node">
                    {item.iconType === "calendar" && <Calendar size={12} />}
                    {item.iconType === "check" && <Check size={12} strokeWidth={2.5} />}
                    {item.iconType === "payment" && <CreditCard size={12} />}
                    {item.iconType === "star" && <Star size={12} fill="#10b926" />}
                  </div>
                  <div className="cc-activity-info">
                    <span className="cc-activity-title">{item.title}</span>
                    <span className="cc-activity-sub">
                      {item.service} • {item.code}
                    </span>
                  </div>
                  <span className="cc-activity-time">{item.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="cc-bottom-col">
          {/* Quick Actions */}
          <div className="cc-content-card cc-quick-actions-card" aria-label="Quick Actions">
            <div className="cc-card-top" style={{ marginBottom: "0.25rem" }}>
              <h2 className="cc-card-heading">
                <Zap size={18} />
                <span>Quick Actions</span>
              </h2>
            </div>

            <Link to="/provider/services" style={{ textDecoration: "none" }}>
              <button className="cc-btn-primary-action" type="button">
                <Plus size={18} strokeWidth={2.5} />
                Add New Service
              </button>
            </Link>

            <div className="cc-btn-action-row">
              <Link to="/provider/bookings" style={{ textDecoration: "none" }}>
                <button
                  className="cc-btn-secondary-action"
                  type="button"
                  style={{ width: "100%" }}
                >
                  <CalendarCheck size={16} />
                  View Bookings
                </button>
              </Link>
              <Link to="/provider/calendar" style={{ textDecoration: "none" }}>
                <button
                  className="cc-btn-secondary-action"
                  type="button"
                  style={{ width: "100%" }}
                >
                  <CalendarDays size={16} />
                  Manage Availability
                </button>
              </Link>
            </div>

            <Link to="/provider/earnings" style={{ textDecoration: "none" }}>
              <button
                className="cc-btn-secondary-action"
                type="button"
                style={{ width: "100%" }}
              >
                <WalletCards size={16} />
                View Earnings
              </button>
            </Link>
          </div>

          {/* Service Performance */}
          <div className="cc-content-card" aria-label="Service Performance">
            <div className="cc-card-top">
              <h2 className="cc-card-heading">
                <Trophy size={18} />
                <span>Service Performance</span>
              </h2>
              <Link to="/provider/services" className="cc-view-all-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            <div className="cc-service-list">
              {servicePerformance.map((service) => (
                <div key={service.id} className="cc-service-item">
                  <span className="cc-service-rank">{service.rank}</span>
                  <img
                    src={serviceImageMap[service.id] || service.image || acRepairImg}
                    alt={service.title}
                    className="cc-service-thumb"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = serviceImageMap[service.id] || acRepairImg;
                    }}
                  />
                  <div className="cc-service-details">
                    <span className="cc-service-name">{service.title}</span>
                    <span className="cc-service-stats">
                      {service.bookings} bookings • {service.revenueFormatted}
                    </span>
                    <span className="cc-service-rating">
                      <Star size={12} />
                      <strong>{service.rating}</strong> ({service.reviewsCount} reviews)
                    </span>
                  </div>
                  <ChevronRight size={18} className="cc-service-chevron" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
