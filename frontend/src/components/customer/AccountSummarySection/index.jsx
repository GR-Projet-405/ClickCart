import React from "react";
import {
  Award,
  CalendarCheck,
  Clock,
  Heart,
} from "lucide-react";
import Card from "../../common/Card";
import "./styles.css";

export default function AccountSummarySection({ stats, onExploreServices }) {
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
      label: "Saved Favorites",
      val: stats.favoriteProviders,
      sub: "Services & Providers",
      icon: Heart,
      color: "#e11d48",
      bg: "#ffe4e6",
      action: onExploreServices,
    },
  ];

  return (
    <div className="account-summary-section">
      <div className="account-summary-section__stats-grid">
        {statCards.map((st, i) => {
          const Icon = st.icon;
          return (
            <Card
              key={i}
              className={`account-summary-section__stat-card ${
                st.action ? "account-summary-section__stat-card--clickable" : ""
              }`}
              onClick={st.action ? st.action : undefined}
              style={{ cursor: st.action ? "pointer" : "default" }}
            >
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
    </div>
  );
}

