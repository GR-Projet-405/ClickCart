import React from "react";
import {
  Check,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import Card from "../common/Card";

function getInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "SP";
}

function formatCompletedDate(value) {
  if (!value) {
    return "Completed booking";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Completed booking";
  }

  return `Completed on ${date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

export default function ReviewEligibilityCard({
  booking = null,
  loading = false,
}) {
  if (loading) {
    return (
      <Card className="review-eligibility-card">
        <div className="reviews-empty-state">
          Checking completed bookings...
        </div>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="review-eligibility-card">
        <div>
          <div className="review-eligibility-card__notice">
            <ShieldCheck size={17} />

            <span>
              <strong>Review Eligibility:</strong>{" "}
              You can review a provider after your booking has been completed.
            </span>
          </div>

          <div className="reviews-empty-state">
            No completed booking is currently available for review.
          </div>
        </div>

        <div className="review-eligibility-card__footer">
          <span>
            Reviews are moderated to maintain safety and authenticity.
          </span>

          <strong>0 Services Awaiting Feedback</strong>
        </div>
      </Card>
    );
  }

  const providerName =
    booking.providerName || "Service Provider";

  const serviceName =
    booking.serviceName || "Booked Service";

  const bookingId =
    booking.bookingId || booking.id || "Unavailable";

  return (
    <Card className="review-eligibility-card">
      <div>
        <div className="review-eligibility-card__notice">
          <ShieldCheck size={17} />

          <span>
            <strong>Review Eligibility:</strong>{" "}
            This completed booking is eligible for a verified review.
          </span>
        </div>

        <div className="review-eligibility-card__booking">
          <div className="review-provider">
            <div className="review-provider__avatar">
              {getInitials(providerName)}

              <span className="review-provider__verified">
                <Check size={10} strokeWidth={3} />
              </span>
            </div>

            <div className="review-provider__details">
              <div className="review-provider__name-row">
                <h3>{providerName}</h3>

                <span className="review-provider__badge">
                  Verified Provider
                </span>
              </div>

              <p>{serviceName}</p>

              <div className="review-provider__booking-meta">
                <span>
                  Booking ID: <strong>#{bookingId}</strong>
                </span>

                <span>•</span>

                <span>
                  {formatCompletedDate(booking.completedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="review-booking-action">
            <span className="review-booking-status">
              <span />
              Completed
            </span>

            <a
              href="#review-form-anchor"
              className="review-booking-action__button"
            >
              <PencilLine size={14} />
              Write Review
            </a>
          </div>
        </div>
      </div>

      <div className="review-eligibility-card__footer">
        <span>
          Reviews are moderated to maintain safety and authenticity.
        </span>

        <strong>1 Service Awaiting Your Feedback</strong>
      </div>
    </Card>
  );
}