import React from "react";
import { Star } from "lucide-react";
import Card from "../common/Card";

const ratingDistribution = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 18 },
  { stars: 3, percentage: 6 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 1 },
];

export default function RatingSummaryCard() {
  return (
    <Card className="rating-summary">
      <div className="rating-summary__score">
        <span className="rating-summary__number">4.8</span>

        <div
          className="rating-summary__stars"
          aria-label="4.8 out of 5 stars"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={20} fill="currentColor" />
          ))}
        </div>

        <p>Based on 128 verified reviews</p>
      </div>

      <div className="rating-summary__distribution">
        {ratingDistribution.map(({ stars, percentage }) => (
          <div className="rating-summary__row" key={stars}>
            <span>{stars}</span>

            <Star
              className="rating-summary__row-star"
              size={15}
              fill="currentColor"
            />

            <div className="rating-summary__bar">
              <div
                className="rating-summary__bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="rating-summary__percentage">
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}