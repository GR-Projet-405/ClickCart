import React from "react";
import { ChevronRight, Star } from "lucide-react";
import Card from "../common/Card";

export default function RatingSummaryCard({
  summary,
  loading = false,
}) {
  const averageRating = Number(
    summary?.averageRating || 0
  );

  const totalReviews = Number(
    summary?.totalReviews || 0
  );

  const distribution =
    summary?.distribution || {};

  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (stars) => {
      const count =
        Number(
          distribution[stars] ??
            distribution[String(stars)] ??
            0
        );

      const percentage =
        totalReviews > 0
          ? Math.round(
              (count / totalReviews) * 100
            )
          : 0;

      let tone = "primary";

      if (stars === 3) {
        tone = "warning";
      }

      if (stars === 2) {
        tone = "orange";
      }

      if (stars === 1) {
        tone = "error";
      }

      return {
        stars,
        count,
        percentage,
        tone,
      };
    }
  );

  return (
    <Card className="rating-summary-card">
      <div>
        <h2 className="rating-summary-card__title">
          Overall Provider Rating
        </h2>

        <div className="rating-summary-card__main">
          <div className="rating-summary-card__score">
            <span className="rating-summary-card__number">
              {loading
                ? "..."
                : averageRating.toFixed(1)}
            </span>

            <div
              className="rating-summary-card__stars"
              aria-label={`${averageRating} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill={
                    star <=
                    Math.round(averageRating)
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    star >
                    Math.round(averageRating)
                      ? "rating-summary-card__star--muted"
                      : ""
                  }
                />
              ))}
            </div>

            <span className="rating-summary-card__review-count">
              Based on {totalReviews} reviews
            </span>
          </div>

          <div className="rating-summary-card__distribution">
            {ratingDistribution.map(
              ({
                stars,
                percentage,
                tone,
              }) => (
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
                      style={{
                        width: `${percentage}%`,
                      }}
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
          Verified Customer Reviews
        </span>

        <a href="#review-form-anchor">
          Review Policy
          <ChevronRight size={14} />
        </a>
      </div>
    </Card>
  );
}