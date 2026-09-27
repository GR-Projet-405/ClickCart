import React from "react";
import {
  Award,
  CalendarCheck,
  CheckCircle,
  Clock,
  Heart,
  Receipt,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import Button from "../../common/Button";
import "./styles.css";

export default function AccountSummarySection({ stats, activities, onExploreServices }) {
  const statCards = [
    {
      label: "Total Bookings",
      val: stats.totalBookings,
      sub: `${stats.completedServices} Completed`,
      icon: CalendarCheck,
      color: "var(--cc-primary)",
      bg: "var(--cc-primary-soft)",
    },
    {
      label: "Active Requests",
      val: stats.activeOrders,
      sub: "In Progress / Scheduled",
      icon: Clock,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "Loyalty Points",
      val: stats.loyaltyPoints,
      sub: "Tier: Silver Rewards",
      icon: Award,
      color: "#7c3aed",
      bg: "#f3e8ff",
    },
    {
      label: "Favorite Pros",
      val: stats.favoriteProviders,
      sub: "Trusted Service Providers",
      icon: Heart,
      color: "#e11d48",
      bg: "#ffe4e6",
    },
  ];

  return (
    <div className="account-summary-section">
      <div className="account-summary-section__stats-grid">
        {statCards.map((st, i) => {
          const Icon = st.icon;
          return (
            <Card key={i} className="account-summary-section__stat-card">
              <div
                className="account-summary-section__stat-icon"
                style={{ color: st.color, backgroundColor: st.bg }}
              >
                <Icon size={22} />
              </div>
              <div className="account-summary-section__stat-text">
                <span className="account-summary-section__stat-label">
                  {st.label}
                </span>
                <strong className="account-summary-section__stat-val">
                  {st.val}
                </strong>
                <span className="account-summary-section__stat-sub">
                  {st.sub}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="account-summary-section__activity-card">
        <div className="account-summary-section__activity-header">
          <div>
            <h2 className="cc-h3 account-summary-section__activity-title">
              Recent Activity & Order History
            </h2>
            <p className="cc-caption cc-text-secondary">
              Latest marketplace requests, bookings, and customer reward events.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onExploreServices}>
            Find More Services
          </Button>
        </div>

        <div className="account-summary-section__activity-list">
          {activities.map((act) => (
            <div key={act.id} className="account-summary-section__activity-item">
              <div className="account-summary-section__activity-avatar">
                {act.iconType === "reward" ? (
                  <Sparkles size={18} color="#7c3aed" />
                ) : (
                  <Wrench size={18} color="var(--cc-primary-dark)" />
                )}
              </div>
              <div className="account-summary-section__activity-main">
                <div className="account-summary-section__activity-title-row">
                  <strong className="account-summary-section__activity-item-title">
                    {act.title}
                  </strong>
                  <Badge variant={act.statusVariant || "info"}>
                    {act.status}
                  </Badge>
                </div>
                <div className="account-summary-section__activity-sub-row">
                  <span className="account-summary-section__activity-prov">
                    {act.provider}
                  </span>
                  &bull;
                  <span className="account-summary-section__activity-date">
                    {act.date}
                  </span>
                </div>
              </div>
              <div className="account-summary-section__activity-amount">
                <strong>{act.amount}</strong>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
