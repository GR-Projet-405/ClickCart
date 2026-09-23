import React from "react";
import { Info } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import RatingSummaryCard from "../../components/reviews/RatingSummaryCard";
import ReviewEligibilityCard from "../../components/reviews/ReviewEligibilityCard";
import WriteReviewForm from "../../components/reviews/WriteReviewForm";
import CustomerReviewsList from "../../components/reviews/CustomerReviewsList";
import "./reviews.css";

export default function CustomerReviewsPage() {
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
