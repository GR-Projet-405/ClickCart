import React from "react";
import PageContainer from "../../components/common/PageContainer";
import CustomerReviewsList from "../../components/reviews/CustomerReviewsList";
import RatingSummaryCard from "../../components/reviews/RatingSummaryCard";
import ReviewEligibilityCard from "../../components/reviews/ReviewEligibilityCard";
import WriteReviewForm from "../../components/reviews/WriteReviewForm";
import "./reviews.css";

export default function CustomerReviewsPage() {
  return (
    <PageContainer className="reviews-page">
      <header className="reviews-page__header">
        <div>
          <h1>Ratings & Reviews</h1>

          <p>
            Share your experience and see verified ratings about ClickCart
            service providers.
          </p>
        </div>
      </header>

      <section className="reviews-overview">
        <RatingSummaryCard />
        <ReviewEligibilityCard />
      </section>

      <section className="reviews-write-section">
        <WriteReviewForm />
      </section>

      <CustomerReviewsList />
    </PageContainer>
  );
}
