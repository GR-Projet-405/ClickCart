import React from "react";
import { ChevronRight, Star } from "lucide-react";
import Card from "../common/Card";

const ratingDistribution = [
  { stars: 5, percentage: 82, tone: "primary" },
  { stars: 4, percentage: 12, tone: "primary" },
  { stars: 3, percentage: 4, tone: "warning" },
  { stars: 2, percentage: 1, tone: "orange" },
  { stars: 1, percentage: 1, tone: "error" },
];

export default function RatingSummaryCard() {
  return (
    <Card className="rating-summary-card">
      <div>
        <h2 className="rating-summary-card__title">
          Overall Provider Rating
        </h2>

        <div className="rating-summary-card__main">
          <div className="rating-summary-card__score">
            <span className="rating-summary-card__number">4.8</span>

            <div
              className="rating-summary-card__stars"
              aria-label="4.8 out of 5 stars"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill="currentColor"
                  className={
                    star === 5
                      ? "rating-summary-card__star--muted"
                      : ""
                  }
                />
              ))}
            </div>

            <span className="rating-summary-card__review-count">
              Based on 248 reviews
            </span>
          </div>

          <div className="rating-summary-card__distribution">
            {ratingDistribution.map(
              ({ stars, percentage, tone }) => (
                <div
                  className="rating-summary-card__row"
                  key={stars}
                >
                  <span className="rating-summary-card__label">
                    {stars} Star
                  </span>

                  <div className="rating-summary-card__bar">
                    <div
                      className={`rating-summary-card__bar-fill rating-summary-card__bar-fill--${tone}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="rating-summary-card__percentage">
                    {percentage}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="rating-summary-card__footer">
        <span className="rating-summary-card__verified">
          <span className="rating-summary-card__verified-dot" />
          100% Verified Customer Reviews
        </span>

        <a href="#review-form-anchor">
          Review Policy
          <ChevronRight size={14} />
        </a>
      </div>
    </Card>
  );
}