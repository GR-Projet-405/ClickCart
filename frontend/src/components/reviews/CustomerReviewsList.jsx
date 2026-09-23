import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Flag,
  Image as ImageIcon,
  LoaderCircle,
  Reply,
  Search,
  ThumbsUp,
} from "lucide-react";

const initialReviews = [
  {
    id: 1,
    initials: "NS",
    customer: "Nimali Silva",
    rating: 5,
    time: "2 days ago",
    service: "AC Repair & Service",
    status: "Published",
    text:
      "Excellent service. Kamal arrived on time, explained the AC issue clearly and completed the repair professionally. The room cooled down within 15 minutes of completion!",
    helpful: 12,
    bookingId: "#BK-9841",
    hasPhoto: true,
    providerResponse:
      "Thank you for your feedback, Nimali. I’m glad I could help and I really appreciate your review. Don't hesitate to reach out if you need filter maintenance before the summer!",
  },
  {
    id: 2,
    initials: "SM",
    customer: "Sahan Mendis",
    rating: 5,
    time: "3 days ago",
    service: "Electrical Work & Wiring",
    status: "Published",
    text:
      "Super quick diagnostic and fair pricing. Kamal found the short circuit in the main breaker within 20 minutes. Highly recommended for any urgent electrical issues.",
    helpful: 8,
    bookingId: "#BK-9827",
    hasPhoto: false,
    providerResponse: null,
  },
  {
    id: 3,
    initials: "KR",
    customer: "Kasun Rajapaksha",
    rating: 4,
    time: "5 days ago",
    service: "AC Repair & Service",
    status: "Pending",
    text:
      "Service was okay and the technician was competent. However, scheduling had a delay.",
    helpful: 0,
    bookingId: "#BK-9765",
    hasPhoto: false,
    providerResponse: null,
  },
];

export default function CustomerReviewsList() {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("recent");
  const [replyText, setReplyText] = useState(
    "Thank you Sahan! Glad we resolved the breaker issue quickly and safely for your home."
  );

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (activeFilter === "5") {
      result = result.filter((review) => review.rating === 5);
    }

    if (activeFilter === "4") {
      result = result.filter((review) => review.rating === 4);
    }

    if (activeFilter === "3") {
      result = result.filter((review) => review.rating === 3);
    }

    if (activeFilter === "photos") {
      result = result.filter((review) => review.hasPhoto);
    }

    const query = searchValue.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (review) =>
          review.customer.toLowerCase().includes(query) ||
          review.service.toLowerCase().includes(query) ||
          review.text.toLowerCase().includes(query)
      );
    }

    if (sortValue === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortValue === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    if (sortValue === "helpful") {
      result.sort((a, b) => b.helpful - a.helpful);
    }

    return result;
  }, [reviews, activeFilter, searchValue, sortValue]);

  const handleHelpful = (reviewId) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  return (
    <section className="customer-reviews-section">
      <div className="customer-reviews-section__heading">
        <div>
          <h2>
            Customer Reviews
            <span>248 Total</span>
          </h2>

          <p>
            Authentic feedback from verified customers who completed service
            bookings.
          </p>
        </div>

        <div className="review-moderation-summary">
          <span className="review-moderation-summary__label">
            Moderation Status:
          </span>

          <span className="review-status-chip review-status-chip--published">
            Published: 242
          </span>

          <span className="review-status-chip review-status-chip--pending">
            Pending Review: 4
          </span>

          <span className="review-status-chip review-status-chip--changes">
            Needs Changes: 2
          </span>
        </div>
      </div>

      <div className="review-toolbar">
        <div className="review-filter-tabs">
          <button
            type="button"
            className={activeFilter === "all" ? "active" : ""}
            onClick={() => setActiveFilter("all")}
          >
            All Reviews (248)
          </button>

          <button
            type="button"
            className={activeFilter === "5" ? "active" : ""}
            onClick={() => setActiveFilter("5")}
          >
            5 Stars (203)
          </button>

          <button
            type="button"
            className={activeFilter === "4" ? "active" : ""}
            onClick={() => setActiveFilter("4")}
          >
            4 Stars (30)
          </button>

          <button
            type="button"
            className={activeFilter === "3" ? "active" : ""}
            onClick={() => setActiveFilter("3")}
          >
            3 Stars (10)
          </button>

          <button
            type="button"
            className={activeFilter === "photos" ? "active" : ""}
            onClick={() => setActiveFilter("photos")}
          >
            <ImageIcon size={14} />
            With Photos (42)
          </button>
        </div>

        <div className="review-toolbar__controls">
          <label className="review-search">
            <Search size={15} />

            <input
              type="search"
              placeholder="Search reviews..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>

          <select
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      <div className="customer-review-list">
        {filteredReviews.map((review) => (
          <article
            className={`customer-review-card ${
              review.status === "Pending"
                ? "customer-review-card--pending"
                : ""
            }`}
            key={review.id}
          >
            <div className="customer-review-card__top">
              <div className="customer-review-author">
                <div className="customer-review-author__avatar">
                  {review.initials}
                </div>

                <div>
                  <div className="customer-review-author__name">
                    <h3>{review.customer}</h3>

                    <span>
                      <CheckCircle2 size={12} />
                      Verified Booking
                    </span>
                  </div>

                  <div className="customer-review-meta">
                    <span className="customer-review-stars">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>

                    <span>•</span>
                    <span>{review.time}</span>
                    <span>•</span>
                    <strong>Service: {review.service}</strong>
                  </div>
                </div>
              </div>

              {review.status === "Published" ? (
                <span className="review-published-badge">
                  <span />
                  Published
                </span>
              ) : (
                <span className="review-pending-badge">
                  <LoaderCircle size={14} />
                  Reported – Pending Moderation Review
                </span>
              )}
            </div>

            {review.status === "Pending" ? (
              <div className="moderated-review-text">
                <p>
                  "{review.text} Contact me at{" "}
                  <span>[Hidden Phone Number]</span> if the provider wants to
                  discuss the invoice discrepancy."
                </p>

                <small>
                  Automated Filter: Personal phone number detected. Masked for
                  customer privacy until author updates text.
                </small>
              </div>
            ) : (
              <p className="customer-review-card__text">
                {review.text}
              </p>
            )}

            {review.hasPhoto && (
              <div className="customer-review-photo">
                <ImageIcon size={22} />
                <span>AC_Unit.jpg</span>
              </div>
            )}

            {review.status === "Published" && (
              <div className="customer-review-actions">
                <div>
                  <button
                    type="button"
                    onClick={() => handleHelpful(review.id)}
                  >
                    <ThumbsUp size={15} />
                    Helpful ({review.helpful})
                  </button>

                  <button type="button">
                    <Flag size={14} />
                    Report Review
                  </button>
                </div>

                <span>
                  Verified via Booking {review.bookingId}
                </span>
              </div>
            )}

            {review.providerResponse && (
              <div className="provider-response">
                <div className="provider-response__heading">
                  <div>
                    <span className="provider-response__avatar">KP</span>
                    <strong>Response from Kamal Perera</strong>
                    <span className="provider-response__badge">
                      Verified Provider
                    </span>
                  </div>

                  <span>1 day ago</span>
                </div>

                <p>{review.providerResponse}</p>
              </div>
            )}

            {review.id === 2 && (
              <div className="provider-reply-area">
                <div className="provider-reply-area__status">
                  <span>
                    <Reply size={15} />
                    Provider Response Active
                  </span>
                </div>

                <div className="provider-reply-box">
                  <div className="provider-reply-box__heading">
                    <strong>
                      Reply as Kamal Perera (Provider)
                    </strong>

                    <span>{replyText.length} / 300 characters</span>
                  </div>

                  <textarea
                    rows={2}
                    maxLength={300}
                    value={replyText}
                    onChange={(event) =>
                      setReplyText(event.target.value)
                    }
                    placeholder="Write a professional and polite reply to Sahan..."
                  />

                  <div className="provider-reply-box__footer">
                    <span>
                      Replies are public and must follow communication
                      policies.
                    </span>

                    <div>
                      <button type="button">Cancel</button>

                      <button type="button">
                        Publish Response
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {review.status === "Pending" && (
              <div className="moderation-audit">
                <span>Action: Author notified to edit content</span>

                <span>
                  ClickCart Trust &amp; Safety AI Guard v2.4
                </span>
              </div>
            )}
          </article>
        ))}

        {filteredReviews.length === 0 && (
          <div className="reviews-empty-state">
            No reviews match your current filters.
          </div>
        )}
      </div>
    </section>
  );
}