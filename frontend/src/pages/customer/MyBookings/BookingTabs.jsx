import React from "react";

export default function BookingTabs({ activeTab, onTabChange, summary }) {
  const tabs = [
    { id: "upcoming", label: "Upcoming", count: summary?.upcomingCount ?? 2 },
    { id: "active", label: "Active", count: summary?.activeCount ?? 1 },
    { id: "history", label: "History", count: summary?.historyCount ?? 3 },
  ];

  return (
    <div className="my-bookings__tabs-container" role="tablist" aria-label="Booking categories">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`my-bookings__tab ${isActive ? "my-bookings__tab--active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label} <span className="my-bookings__tab-count">({tab.count})</span>
          </button>
        );
      })}
    </div>
  );
}
