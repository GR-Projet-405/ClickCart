import React from "react";
import {
  Check,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import Card from "../common/Card";

export default function ReviewEligibilityCard() {
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

        <div className="review-eligibility-card__booking">
          <div className="review-provider">
            <div className="review-provider__avatar">
              KP

              <span className="review-provider__verified">
                <Check size={10} strokeWidth={3} />
              </span>
            </div>

            <div className="review-provider__details">
              <div className="review-provider__name-row">
                <h3>Kamal Perera</h3>

                <span className="review-provider__badge">
                  Verified Provider
                </span>
              </div>

              <p>AC Repair &amp; Installation</p>

              <div className="review-provider__booking-meta">
                <span>
                  Booking ID: <strong>#BK-10428</strong>
                </span>

                <span>•</span>

                <span>Completed yesterday</span>
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

        <strong>
          1 Service Awaiting Your Feedback
        </strong>
      </div>
    </Card>
  );
}