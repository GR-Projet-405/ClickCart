import React, {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Flag,
  Image as ImageIcon,
  Search,
  ThumbsUp,
} from "lucide-react";

export default function CustomerReviewsList({
  reviews = [],
  loading = false,
  onHelpful,
  onReport,
}) {
  const [activeFilter, setActiveFilter] =
    useState("all");

  const [searchValue, setSearchValue] =
    useState("");

  const [sortValue, setSortValue] =
    useState("recent");

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (["5", "4", "3", "2", "1"].includes(
      activeFilter
    )) {
      result = result.filter(
        (review) =>
          review.rating ===
          Number(activeFilter)
      );
    }

    if (activeFilter === "photos") {
      result = result.filter(
        (review) =>
          Array.isArray(review.photoUrls) &&
          review.photoUrls.length > 0
      );
    }

    const query =
      searchValue.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (review) =>
          review.content
            ?.toLowerCase()
            .includes(query) ||
          review.bookingId
            ?.toLowerCase()
            .includes(query) ||
          review.serviceId
            ?.toLowerCase()
            .includes(query)
      );
    }

    if (sortValue === "highest") {
      result.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortValue === "lowest") {
      result.sort(
        (a, b) => a.rating - b.rating
      );
    }

    if (sortValue === "helpful") {
      result.sort(
        (a, b) =>
          (b.helpfulCount || 0) -
          (a.helpfulCount || 0)
      );
    }

    if (sortValue === "recent") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [
    reviews,
    activeFilter,
    searchValue,
    sortValue,
  ]);

  const countByRating = (rating) =>
    reviews.filter(
      (review) =>
        review.rating === rating
    ).length;

  const photoCount = reviews.filter(
    (review) =>
      Array.isArray(review.photoUrls) &&
      review.photoUrls.length > 0
  ).length;

  function formatDate(value) {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <section className="customer-reviews-section">
        <div className="reviews-empty-state">
          Loading customer reviews...
        </div>
      </section>
    );
  }

  return (
    <section className="customer-reviews-section">
      <div className="customer-reviews-section__heading">
        <div>
          <h2>
            Customer Reviews
            <span>
              {reviews.length} Total
            </span>
          </h2>

          <p>
            Authentic feedback from verified
            customers who completed service
            bookings.
          </p>
        </div>
      </div>

      <div className="review-toolbar">
        <div className="review-filter-tabs">
          <button
            type="button"
            className={
              activeFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("all")
            }
          >
            All Reviews ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map(
            (rating) => (
              <button
                key={rating}
                type="button"
                className={
                  activeFilter ===
                  String(rating)
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(
                    String(rating)
                  )
                }
              >
                {rating} Stars (
                {countByRating(rating)})
              </button>
            )
          )}

          <button
            type="button"
            className={
              activeFilter === "photos"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter("photos")
            }
          >
            <ImageIcon size={14} />
            With Photos ({photoCount})
          </button>
        </div>

        <div className="review-toolbar__controls">
          <label className="review-search">
            <Search size={15} />

            <input
              type="search"
              placeholder="Search reviews..."
              value={searchValue}
              onChange={(event) =>
                setSearchValue(
                  event.target.value
                )
              }
            />
          </label>

          <select
            value={sortValue}
            onChange={(event) =>
              setSortValue(
                event.target.value
              )
            }
          >
            <option value="recent">
              Most Recent
            </option>

            <option value="highest">
              Highest Rated
            </option>

            <option value="lowest">
              Lowest Rated
            </option>

            <option value="helpful">
              Most Helpful
            </option>
          </select>
        </div>
      </div>

      <div className="customer-review-list">
        {filteredReviews.map(
          (review) => (
            <article
              className="customer-review-card"
              key={review.id}
            >
              <div className="customer-review-card__top">
                <div className="customer-review-author">
                  <div className="customer-review-author__avatar">
                    VC
                  </div>

                  <div>
                    <div className="customer-review-author__name">
                      <h3>
                        Verified Customer
                      </h3>

                      {review.verifiedBooking && (
                        <span>
                          <CheckCircle2
                            size={12}
                          />
                          Verified Booking
                        </span>
                      )}
                    </div>

                    <div className="customer-review-meta">
                      <span className="customer-review-stars">
                        {"★".repeat(
                          review.rating
                        )}

                        {"☆".repeat(
                          5 - review.rating
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        {formatDate(
                          review.createdAt
                        )}
                      </span>

                      {review.serviceId && (
                        <>
                          <span>•</span>

                          <strong>
                            Service:{" "}
                            {review.serviceId}
                          </strong>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="review-published-badge">
                  <span />
                  Published
                </span>
              </div>

              <p className="customer-review-card__text">
                {review.content}
              </p>

              {Array.isArray(
                review.photoUrls
              ) &&
                review.photoUrls.length >
                  0 && (
                  <div className="write-review-photo-grid">
                    {review.photoUrls.map(
                      (photoUrl, index) => (
                        <div
                          className="write-review-photo"
                          key={`${review.id}-${index}`}
                        >
                          <img
                            src={photoUrl}
                            alt={`Review photo ${
                              index + 1
                            }`}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

              <div className="customer-review-actions">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      onHelpful?.(
                        review.id
                      )
                    }
                  >
                    <ThumbsUp size={15} />

                    Helpful (
                    {review.helpfulCount ||
                      0}
                    )
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onReport?.(
                        review.id
                      )
                    }
                  >
                    <Flag size={14} />
                    Report Review
                  </button>
                </div>

                <span>
                  Verified via Booking{" "}
                  {review.bookingId}
                </span>
              </div>

              {review.providerResponse && (
                <div className="provider-response">
                  <div className="provider-response__heading">
                    <div>
                      <span className="provider-response__avatar">
                        SP
                      </span>

                      <strong>
                        Response from Service
                        Provider
                      </strong>

                      <span className="provider-response__badge">
                        Verified Provider
                      </span>
                    </div>
                  </div>

                  <p>
                    {
                      review.providerResponse
                    }
                  </p>
                </div>
              )}
            </article>
          )
        )}

        {filteredReviews.length ===
          0 && (
          <div className="reviews-empty-state">
            No reviews match your current
            filters.
          </div>
        )}
      </div>
    </section>
  );
}