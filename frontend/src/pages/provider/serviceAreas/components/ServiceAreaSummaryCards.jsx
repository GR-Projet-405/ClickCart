import React from "react";
import { MapPin, Check, Target } from "lucide-react";
import Card from "../../../../components/common/Card";
import "./ServiceAreaSummaryCards.css";

export default function ServiceAreaSummaryCards({ summary, loading }) {
  const cards = [
    {
      id: "total",
      label: "Total Coverage Areas",
      value: summary ? summary.totalCoverageAreas : 0,
      subtext: "Total service areas configured",
      icon: MapPin,
    },
    {
      id: "active",
      label: "Active Locations",
      value: summary ? summary.activeLocations : 0,
      subtext: "Currently active service areas",
      icon: Check,
    },
    {
      id: "radius",
      label: "Total Radius (Km)",
      value: summary ? `${Math.round(summary.totalRadiusKm)} km` : "0 km",
      subtext: "Combined coverage radius",
      icon: Target,
    },
  ];

  return (
    <div className="cc-summary-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.id} className="cc-summary-card" padding="md">
            <div className="cc-summary-card__icon-wrap">
              <Icon size={20} className="cc-summary-card__icon" />
            </div>
            <div className="cc-summary-card__content">
              <span className="cc-summary-card__label">{card.label}</span>
              <span className="cc-summary-card__value">
                {loading ? "..." : card.value}
              </span>
              <span className="cc-summary-card__subtext">{card.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
