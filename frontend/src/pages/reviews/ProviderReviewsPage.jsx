import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageSquareReply,
  Star,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageContainer from "../../components/common/PageContainer";

import {
  DEV_PROVIDER_ID,
  fetchProviderRatingSummary,
  fetchProviderReviews,
  publishProviderResponse,
} from "../../services/reviewService";

import "./reviews.css";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReviewStars({ rating }) {
  return (
    <span
      className="customer-review-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: {},
  });

  const [replyValues, setReplyValues] = useState({});
  const [replyingId, setReplyingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadReviews() {
      setLoading(true);
      setError("");

      try {
        const [reviewData, summaryData] = await Promise.all([
          fetchProviderReviews(DEV_PROVIDER_ID),
          fetchProviderRatingSummary(DEV_PROVIDER_ID),
        ]);

        if (ignore) {
          return;
        }

        setReviews(reviewData || []);

        setSummary(
          summaryData || {
            averageRating: 0,
            totalReviews: 0,
            distribution: {},
          }
        );
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError.message ||
              "Provider reviews could not be loaded."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      ignore = true;
    };
  }, []);

  function handleReplyChange(reviewId, value) {
    setReplyValues((current) => ({
      ...current,
      [reviewId]: value,
    }));
  }

  async function handlePublishResponse(reviewId) {
    const responseText = (
      replyValues[reviewId] || ""
    ).trim();

    if (!responseText) {
      setError("Please enter a provider response.");
      return;
    }

    if (responseText.length > 300) {
      setError(
        "Provider response must not exceed 300 characters."
      );
      return;
    }

    setReplyingId(reviewId);
    setError("");
    setSuccessMessage("");

    try {
      const updatedReview =
        await publishProviderResponse(
          reviewId,
          responseText,
          DEV_PROVIDER_ID
        );

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? updatedReview
            : review
        )
      );

      setReplyValues((current) => ({
        ...current,
        [reviewId]: "",
      }));

      setSuccessMessage(
        "Provider response published successfully."
      );
    } catch (publishError) {
      setError(
        publishError.message ||
          "Provider response could not be published."
      );
    } finally {
      setReplyingId("");
    }
  }

  return (
    <PageContainer className="reviews-page">
      <header className="reviews-page__header">
        <div>
          <h1>Ratings &amp; Reviews</h1>

          <p>
            View customer feedback and respond to verified
            reviews.
          </p>
        </div>
      </header>

      <section className="reviews-overview">
        <Card className="rating-summary-card">
          <div>
            <h2 className="rating-summary-card__title">
              Overall Rating
            </h2>

            <div className="rating-summary-card__score">
              <span className="rating-summary-card__number">
                {Number(summary.averageRating || 0).toFixed(1)}
              </span>

              <div className="rating-summary-card__stars">
                <Star
                  size={18}
                  fill="currentColor"
                />

                <span>
                  {summary.totalReviews} verified reviews
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="review-eligibility-card">
          <div>
            <h2 className="rating-summary-card__title">
              Review Management
            </h2>

            <p>
              Respond professionally to customer reviews.
              Provider responses are public.
            </p>

            <div className="review-eligibility-card__footer">
              <span>Total Reviews</span>

              <strong>
                {summary.totalReviews}
              </strong>
            </div>
          </div>
        </Card>
      </section>

      <section className="customer-reviews-section">
        <div className="customer-reviews-section__heading">
          <div>
            <h2>
              Customer Reviews
              <span>{reviews.length}</span>
            </h2>

            <p>
              Feedback submitted through verified ClickCart
              bookings.
            </p>
          </div>
        </div>

        {error && (
          <p
            className="review-form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {successMessage && (
          <p className="review-form-success">
            {successMessage}
          </p>
        )}

        {loading ? (
          <div className="reviews-empty-state">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty-state">
            No customer reviews are available yet.
          </div>
        ) : (
          <div className="customer-review-list">
            {reviews.map((review) => {
              const replyValue =
                replyValues[review.id] || "";

              return (
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
                          <h3>Verified Customer</h3>

                          {review.verifiedBooking && (
                            <span>
                              <CheckCircle2 size={12} />
                              Verified Booking
                            </span>
                          )}
                        </div>

                        <div className="customer-review-meta">
                          <ReviewStars
                            rating={review.rating}
                          />

                          <span>•</span>

                          <span>
                            {formatDate(review.createdAt)}
                          </span>

                          {review.serviceId && (
                            <>
                              <span>•</span>

                              <strong>
                                Service ID:{" "}
                                {review.serviceId}
                              </strong>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={
                        review.moderationStatus ===
                        "PUBLISHED"
                          ? "review-published-badge"
                          : "review-pending-badge"
                      }
                    >
                      {review.moderationStatus ===
                      "PUBLISHED" ? (
                        <>
                          <span />
                          Published
                        </>
                      ) : (
                        review.moderationStatus
                      )}
                    </span>
                  </div>

                  <p className="customer-review-card__text">
                    {review.content}
                  </p>

                  <div className="customer-review-actions">
                    <span>
                      Helpful ({review.helpfulCount || 0})
                    </span>

                    <span>
                      Booking: {review.bookingId}
                    </span>
                  </div>

                  {review.providerResponse ? (
                    <div className="provider-response">
                      <div className="provider-response__heading">
                        <div>
                          <strong>
                            Your Public Response
                          </strong>

                          <span className="provider-response__badge">
                            Verified Provider
                          </span>
                        </div>
                      </div>

                      <p>
                        {review.providerResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="provider-reply-area">
                      <div className="provider-reply-area__status">
                        <span>
                          <MessageSquareReply size={15} />
                          Respond to Review
                        </span>
                      </div>

                      <div className="provider-reply-box">
                        <div className="provider-reply-box__heading">
                          <strong>
                            Write a public response
                          </strong>

                          <span>
                            {replyValue.length} / 300
                            characters
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          maxLength={300}
                          value={replyValue}
                          onChange={(event) =>
                            handleReplyChange(
                              review.id,
                              event.target.value
                            )
                          }
                          placeholder="Write a professional and polite response..."
                        />

                        <div className="provider-reply-box__footer">
                          <span>
                            Your response will be visible
                            publicly.
                          </span>

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleReplyChange(
                                  review.id,
                                  ""
                                )
                              }
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={
                                replyingId === review.id ||
                                !replyValue.trim()
                              }
                              onClick={() =>
                                handlePublishResponse(
                                  review.id
                                )
                              }
                            >
                              {replyingId === review.id
                                ? "Publishing..."
                                : "Publish Response"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}