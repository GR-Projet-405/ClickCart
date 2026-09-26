import { useEffect, useState } from "react";

import { Info } from "lucide-react";

import PageContainer from "../../components/common/PageContainer";
import RatingSummaryCard from "../../components/reviews/RatingSummaryCard";
import ReviewEligibilityCard from "../../components/reviews/ReviewEligibilityCard";
import WriteReviewForm from "../../components/reviews/WriteReviewForm";
import CustomerReviewsList from "../../components/reviews/CustomerReviewsList";

import {
  DEV_PROVIDER_ID,
  fetchProviderRatingSummary,
  fetchPublishedProviderReviews,
  markReviewHelpful,
  reportReview,
} from "../../services/reviewService";

import "./reviews.css";

export default function CustomerReviewsPage() {
  const eligibleBooking = null;

  const [reviews, setReviews] = useState([]);

  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: {},
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  async function loadReviewData() {
    setLoading(true);
    setError("");

    try {
      const [reviewData, summaryData] = await Promise.all([
        fetchPublishedProviderReviews(DEV_PROVIDER_ID),

        fetchProviderRatingSummary(DEV_PROVIDER_ID),
      ]);

      setReviews(reviewData || []);

      setSummary(
        summaryData || {
          averageRating: 0,
          totalReviews: 0,
          distribution: {},
        },
      );
    } catch (loadError) {
      setError(loadError.message || "Reviews could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviewData();
  }, []);

  async function handleHelpful(reviewId) {
    setError("");
    setMessage("");

    try {
      const updatedReview = await markReviewHelpful(reviewId);

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId ? updatedReview : review,
        ),
      );
    } catch (helpfulError) {
      setError(helpfulError.message || "Review could not be marked helpful.");
    }
  }

  async function handleReport(reviewId) {
    setError("");
    setMessage("");

    try {
      await reportReview(reviewId);

      // A reported review changes to
      // PENDING_REVIEW, so remove it from
      // the public published list.
      setReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );

      setMessage("Review reported successfully and sent for moderation.");

      const summaryData = await fetchProviderRatingSummary(DEV_PROVIDER_ID);

      setSummary(summaryData);
    } catch (reportError) {
      setError(reportError.message || "Review could not be reported.");
    }
  }

  return (
    <PageContainer className="reviews-page">
      <header className="reviews-page__header">
        <div>
          <h1>Ratings &amp; Reviews</h1>

          <p>
            Share your experience and see verified ratings about ClickCart
            certified service providers.
          </p>
        </div>

        <a href="#review-guidelines" className="reviews-page__guidelines">
          <Info size={15} />
          Community Guidelines
        </a>
      </header>

      {error && (
        <p className="review-form-error" role="alert">
          {error}
        </p>
      )}

      {message && <p className="review-form-success">{message}</p>}

      <section className="reviews-overview">
        <RatingSummaryCard summary={summary} loading={loading} />

        <ReviewEligibilityCard booking={eligibleBooking} />
      </section>

      <section className="reviews-write-section">
        <WriteReviewForm booking={eligibleBooking} />
      </section>

      <CustomerReviewsList
        reviews={reviews}
        loading={loading}
        onHelpful={handleHelpful}
        onReport={handleReport}
      />
    </PageContainer>
  );
}
