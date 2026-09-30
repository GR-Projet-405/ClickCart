import React from "react";
import { Calendar, Clock, MapPin, Star } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import Button from "../../../components/common/Button";

export default function BookingCard({ booking, onViewDetails }) {
  const {
    serviceTitle,
    imageUrl,
    statusLabel,
    status,
    providerName,
    providerAvatar,
    providerRating,
    providerReviewCount,
    bookingDate,
    timeSlot,
    location,
    totalCost,
    currency = "LKR",
  } = booking;

  // Badge variant determination
  const getBadgeClass = () => {
    switch (status) {
      case "UPCOMING":
      case "CONFIRMED":
        return "booking-card__badge--confirmed";
      case "ACTIVE":
      case "IN_PROGRESS":
        return "booking-card__badge--active";
      case "COMPLETED":
        return "booking-card__badge--completed";
      case "CANCELLED":
        return "booking-card__badge--cancelled";
      default:
        return "booking-card__badge--neutral";
    }
  };

  const formattedCost = (totalCost || 0).toLocaleString("en-US");

  return (
    <article className="booking-card">
      <div className="booking-card__image-container">
        <img
          src={imageUrl}
          alt={serviceTitle}
          className="booking-card__image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop";
          }}
        />
      </div>

      <div className="booking-card__content">
        <div className="booking-card__header">
          <h3 className="booking-card__title">{serviceTitle}</h3>
          <span className={`booking-card__badge ${getBadgeClass()}`}>
            {statusLabel || "Confirmed"}
          </span>
        </div>

        <div className="booking-card__provider">
          <Avatar src={providerAvatar} fallback={providerName?.[0] || "P"} size="sm" />
          <span className="booking-card__provider-name">{providerName}</span>
          <span className="booking-card__rating-separator">|</span>
          <div className="booking-card__rating">
            <Star className="booking-card__star-icon" size={14} fill="#f59e0b" color="#f59e0b" />
            <span className="booking-card__rating-score">{providerRating || 5.0}</span>
            <span className="booking-card__rating-count">({providerReviewCount || 0})</span>
          </div>
        </div>

        <div className="booking-card__meta">
          <div className="booking-card__meta-item">
            <Calendar size={15} className="booking-card__meta-icon" />
            <span>{bookingDate}</span>
          </div>
          <div className="booking-card__meta-item">
            <Clock size={15} className="booking-card__meta-icon" />
            <span>{timeSlot}</span>
          </div>
          <div className="booking-card__meta-item">
            <MapPin size={15} className="booking-card__meta-icon" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="booking-card__right">
        <div className="booking-card__cost-block">
          <span className="booking-card__cost-label">TOTAL COST</span>
          <span className="booking-card__cost-amount">
            {currency} {formattedCost}
          </span>
        </div>
        <Button
          variant="outline"
          className="booking-card__action-btn"
          onClick={() => onViewDetails(booking)}
        >
          View Details
        </Button>
      </div>
    </article>
  );
}
