import React from "react";
import { Link } from "react-router-dom";
import { Search, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./LandingPage.css";

export default function LandingPage() {
  const { status, user } = useAuth();
  const isAuthenticated = status === "authenticated" && !!user;

  return (
    <div className="landing-page">

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero__content">
          <h1 className="landing-hero__title">
            Find the Perfect Professional for Any Job
          </h1>
          <p className="landing-hero__subtitle">
            Connect with trusted, verified local service providers for your home, business, and personal needs. Fast, reliable, and secure.
          </p>
          <div className="landing-hero__actions">
            <Link to="/find-services" className="cc-button cc-button--primary cc-button--lg">
              Explore Services <Search size={20} className="ml-2" />
            </Link>
            <Link to="/register" state={{ role: "SERVICE_PROVIDER" }} className="cc-button cc-button--outline cc-button--lg">
              Become a Provider <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features__grid">
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">
              <Shield size={32} />
            </div>
            <h3 className="landing-feature-card__title">Verified Professionals</h3>
            <p className="landing-feature-card__desc">Every provider undergoes strict identity and skill verification.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">
              <Clock size={32} />
            </div>
            <h3 className="landing-feature-card__title">Instant Booking</h3>
            <p className="landing-feature-card__desc">Find availability and book services instantly, completely online.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-card__icon">
              <Star size={32} />
            </div>
            <h3 className="landing-feature-card__title">Trusted Reviews</h3>
            <p className="landing-feature-card__desc">Read genuine reviews and ratings from real customers.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta__content">
          {isAuthenticated ? (
            <>
              <h2 className="landing-cta__title">Ready to find what you need?</h2>
              <p className="landing-cta__desc">Start exploring our marketplace for trusted local professionals.</p>
              <div className="landing-cta__actions">
                <Link to="/find-services" className="cc-button cc-button--primary cc-button--lg">Explore Services</Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="landing-cta__title">Ready to get started?</h2>
              <p className="landing-cta__desc">Join thousands of customers who trust ClickCart for their everyday needs.</p>
              <div className="landing-cta__actions">
                <Link to="/register" className="cc-button cc-button--primary cc-button--lg">Create Free Account</Link>
              </div>
            </>
          )}
        </div>
      </section>


    </div>
  );
}
