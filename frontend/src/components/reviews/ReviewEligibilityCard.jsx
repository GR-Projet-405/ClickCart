import React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Card from "../common/Card";

export default function ReviewEligibilityCard() {
  return (
    <Card className="review-eligibility">
      <div className="review-eligibility__icon">
        <CheckCircle2 size={24} />
      </div>

      <div className="review-eligibility__content">
        <div className="review-eligibility__heading">
          <div>
            <span className="review-eligibility__status">
              Completed Booking
            </span>

            <h2>You can review this service</h2>
          </div>

          <ShieldCheck
            className="review-eligibility__verified-icon"
            size={22}
          />
        </div>

        <div className="review-eligibility__booking">
          <CalendarCheck size={18} />

          <div>
            <strong>Home Cleaning Service</strong>
            <span>
              Completed on 18 September 2026
            </span>
          </div>
        </div>

        <p className="review-eligibility__notice">
          Only customers with a completed ClickCart booking can submit a
          verified review.
        </p>
      </div>
    </Card>
  );
}