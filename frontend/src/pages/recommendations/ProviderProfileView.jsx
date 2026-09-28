import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Zap,
  Shield,
  Award
} from 'lucide-react';

import './ProviderProfileView.css';
import plumberImg from '../../assets/images/recommendations/plumber1.jpg';

export default function ProviderProfileView({
  provider,
  onBack,
  onBookService
}) {
  // Ensure the window forces a hard reset to the very top of the page on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  if (!provider) return null;

  const servicesOffered = [
    {
      title: 'Emergency Pipe Repair',
      desc: 'Burst pipes, rapid shutoff valve restoration, and PVC/PPR replacements.',
      time: 'Approx. 45 - 60 mins • Free safety seal',
      price: 2000
    },
    {
      title: 'Bathroom Leak Detection & Sealing',
      desc: 'Concealed wall line acoustic inspection, mixer valve re-seating & siliconing.',
      time: 'Approx. 90 mins • Includes moisture testing',
      price: 2800
    },
    {
      title: 'Overhead Tank & Pump Overhaul',
      desc: 'Float sensor calibration, auto-cutoff relay checks, pressure test & inlet scrub.',
      time: 'Approx. 2 hrs • Certified electrician certified',
      price: 3500
    },
    {
      title: 'Drain Jetting & Unclogging',
      desc: 'Mechanical auger and pressurized line clearance for kitchens, gully traps, and main lines.',
      time: 'Approx. 60 mins • Chemical-free clear guarantee',
      price: 2200
    }
  ];

  const alternativeProviders = [
    {
      name: 'Lanka Flow Fixers',
      location: 'Gorakana, Panadura (1.4 km)',
      score: 96,
      rating: 4.8,
      reviews: 142,
      price: 1800,
      tag: 'Specializes in emergency leaks and low water pressure issues. 320+ jobs completed.'
    },
    {
      name: 'QuickPipe Express',
      location: 'Wekada, Panadura (2.1 km)',
      score: 94,
      rating: 4.7,
      reviews: 98,
      price: 2200,
      tag: 'Equipped with motor snake and acoustic underground leak listening sensors.'
    },
    {
      name: 'Apex Sanity & Pipes',
      location: 'Nalluruwa, Panadura (2.8 km)',
      score: 91,
      rating: 4.8,
      reviews: 210,
      price: 2400,
      tag: 'Overhead tank specialists, solar hot water connectivity, and complete repiping.'
    }
  ];

  const startingPrice = Number(provider.startingPrice) || 0;
  const rating = provider.rating ?? 0;
  const reviewCount = provider.reviewCount ?? 0;
  const distance = provider.distance ?? 0;
  const matchScore = provider.matchScore ?? 0;

  return (
    <div
      className="dev15-profile-container"
      id="top-profile-anchor"
    >
      {/* Top Navigation Banner */}
      <nav className="dev15-profile-nav">
        <button
          className="dev15-back-link"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to Recommended Providers
        </button>

        <span className="dev15-live-indicator">
          <span className="dev15-pulse-dot" />
          Panadura Sector Live Match Engine Active
        </span>
      </nav>

      {/* Algorithmic Verification Banner */}
      <div className="dev15-algo-banner">
        <div className="dev15-algo-icon">
          <Zap size={20} />
        </div>

        <div>
          <strong>
            ALGORITHMIC RECOMMENDATION VERIFIED
          </strong>

          <p>
            You are viewing this profile via ClickCart
            Recommendations for {provider.service} in
            Panadura. Algorithmic match based on verified
            trade merit, real-time dispatch availability,
            and {distance} km local proximity.
          </p>
        </div>
      </div>

      <div className="dev15-profile-grid-layout">
        {/* Left Column */}
        <div className="dev15-profile-main-col">
          {/* Header Card */}
          <div className="dev15-profile-header-card">
            <div className="dev15-profile-avatar-wrap">
              <img
                src={provider.image || plumberImg}
                alt={provider.name || 'Provider'}
              />
            </div>

            <div className="dev15-profile-main-info">
              <div className="dev15-tag-row">
                <span className="dev15-badge-success">
                  <ShieldCheck size={14} />
                  Recommended Pro
                </span>

                <span className="dev15-badge-muted">
                  <Shield size={14} />
                  Background Verified
                </span>

                <span className="dev15-badge-id">
                  ID: LKR-W892
                </span>
              </div>

              <h1>{provider.name}</h1>

              <div className="dev15-meta-stats-row">
                <span>
                  <Star
                    size={16}
                    className="dev15-star-yellow"
                  />{' '}
                  <strong>{rating}</strong> (
                  {reviewCount} verified reviews)
                </span>

                <span>• Top 3% in Western Province</span>

                <span>
                  • <MapPin size={14} /> {distance} km away
                </span>

                <span>• Member since 2021</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="dev15-metrics-grid">
            <div className="dev15-metric-box">
              <h3>420+</h3>
              <p>Completed Bookings</p>
            </div>

            <div className="dev15-metric-box">
              <h3>99.4%</h3>
              <p>On-Time Dispatch</p>
            </div>

            <div className="dev15-metric-box">
              <h3>15 min</h3>
              <p>Average Response</p>
            </div>
          </div>

          {/* Explainability Breakdown Box */}
          <div className="dev15-explain-box">
            <div className="dev15-explain-title-row">
              <h3>
                Why we recommended this provider for you
              </h3>

              <span className="dev15-score-badge-large">
                {matchScore}% Match Score
              </span>
            </div>

            <div className="dev15-explain-grid-2x3">
              <div className="dev15-explain-item">
                <CheckCircle2
                  size={16}
                  className="dev15-text-success"
                />

                <div>
                  <h4>Requirement Fit</h4>
                  <p>
                    Perfect match for '{provider.service}'
                    service requests registered in Panadura
                    South & Central zone.
                  </p>
                </div>
              </div>

              <div className="dev15-explain-item">
                <CheckCircle2
                  size={16}
                  className="dev15-text-success"
                />

                <div>
                  <h4>Proximity Advantage</h4>
                  <p>
                    Closest active provider in Panadura (
                    {distance} km), minimizing transit delays
                    and zero emergency surge surcharge.
                  </p>
                </div>
              </div>

              <div className="dev15-explain-item">
                <CheckCircle2
                  size={16}
                  className="dev15-text-success"
                />

                <div>
                  <h4>Immediate Availability</h4>
                  <p>
                    Confirmed available morning dispatch slot
                    for Tomorrow morning (no waitlist or
                    pre-booking bottleneck).
                  </p>
                </div>
              </div>

              <div className="dev15-explain-item">
                <CheckCircle2
                  size={16}
                  className="dev15-text-success"
                />

                <div>
                  <h4>Transparent Pricing Index</h4>
                  <p>
                    100% price consistency: Diagnostic and
                    initial fix within your LKR 2,000 - 4,000
                    budget bracket.
                  </p>
                </div>
              </div>
            </div>

            <div className="dev15-neighborhood-sentiment">
              <CheckCircle2
                size={16}
                className="dev15-text-success"
              />

              <div>
                <strong>Neighborhood Sentiment</strong>

                <p>
                  High repeat customer satisfaction score
                  (4.9/5 from 184 Panadura neighbors). Zero
                  unresolved dispute tickets over the last
                  18 months.
                </p>
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="dev15-services-section">
            <div className="dev15-section-title-row">
              <div>
                <h2>
                  Services Offered by {provider.name}
                </h2>

                <p>
                  All bookings backed by ClickCart Escrow
                  Guarantee and 7-day workmanship warranty
                </p>
              </div>

              <span className="dev15-view-all">
                View All (8)
              </span>
            </div>

            <div className="dev15-service-offered-list">
              {servicesOffered.map((svc, idx) => (
                <div
                  key={idx}
                  className="dev15-service-row-card"
                >
                  <div className="dev15-svc-icon">
                    <Award size={20} />
                  </div>

                  <div className="dev15-svc-details">
                    <h4>{svc.title}</h4>
                    <p>{svc.desc}</p>
                    <span className="dev15-svc-time">
                      {svc.time}
                    </span>
                  </div>

                  <div className="dev15-svc-pricing">
                    <span className="dev15-price-val">
                      LKR {svc.price.toLocaleString()}
                    </span>

                    <button
                      className="dev15-btn-select-svc"
                      onClick={() =>
                        onBookService(provider)
                      }
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Providers */}
          <div className="dev15-alternatives-section">
            <h2>
              More Providers You May Like in Panadura
            </h2>

            <p className="dev15-subtext">
              Alternative verified professionals offering
              plumbing and pipe services nearby
            </p>

            <div className="dev15-alt-grid">
              {alternativeProviders.map((alt, idx) => (
                <div
                  key={idx}
                  className="dev15-alt-card"
                >
                  <div className="dev15-alt-header">
                    <span className="dev15-badge-success-sm">
                      {alt.score}% Match
                    </span>

                    <span className="dev15-verified-sm">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  </div>

                  <h4>{alt.name}</h4>

                  <span className="dev15-alt-loc">
                    {alt.location}
                  </span>

                  <p className="dev15-alt-tag">
                    {alt.tag}
                  </p>

                  <div className="dev15-alt-footer">
                    <div>
                      <span className="dev15-star-row">
                        <Star
                          size={12}
                          className="dev15-star-yellow"
                        />{' '}
                        {alt.rating} ({alt.reviews})
                      </span>

                      <strong>
                        LKR {alt.price.toLocaleString()}
                      </strong>
                    </div>

                    <button className="dev15-btn-secondary-sm">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dev15-profile-sidebar">
          <div className="dev15-sticky-booking-card">
            <div className="dev15-rate-header">
              <span>STARTING RATE</span>

              <div className="dev15-sidebar-price">
                <strong>
                  LKR {startingPrice.toLocaleString()}
                </strong>

                <span>Diagnostic included</span>
              </div>
            </div>

            <div className="dev15-next-slot-pill">
              <Calendar size={16} />

              <div>
                <span className="dev15-slot-label">
                  Next Available
                </span>

                <strong>Tomorrow, 9:00 AM</strong>
              </div>
            </div>

            <button
              className="dev15-btn-primary dev15-full-w"
              onClick={() => onBookService(provider)}
            >
              <Zap size={16} />
              Book Service Now
            </button>

            <button className="dev15-btn-secondary dev15-full-w">
              <MessageSquare size={16} />
              Message Provider
            </button>

            <button className="dev15-text-btn-center">
              Save to Favorites
            </button>

            <div className="dev15-escrow-box">
              <div className="dev15-escrow-title">
                <Shield size={16} />
                ClickCart Escrow Protection
              </div>

              <p>
                Your money is held safely in escrow. Release
                payment only after work is inspected and
                signed off.
              </p>
            </div>

            <div className="dev15-sidebar-badges">
              <span>
                <CheckCircle2
                  size={14}
                  className="dev15-text-success"
                />
                Verified Credentials
              </span>

              <span>
                <CheckCircle2
                  size={14}
                  className="dev15-text-success"
                />
                Free Reschedule
              </span>
            </div>
          </div>

          {/* Territory Map Widget */}
          <div className="dev15-territory-card">
            <div className="dev15-territory-header">
              <span>Panadura Service Territory</span>

              <span className="dev15-live-cov">
                Live coverage
              </span>
            </div>

            <div className="dev15-mock-map">
              <div className="dev15-map-pin-badge">
                Panadura Central
              </div>
            </div>

            <p>
              Active within 12km radius of Panadura Clock
              Tower, including Wadduwa, Moratuwa, and
              Bandaragama border.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Guarantee Banner */}
      <footer className="dev15-bottom-guarantee">
        <div className="dev15-guarantee-icon">
          <ShieldCheck size={28} />
        </div>

        <div className="dev15-guarantee-content">
          <h4>
            Need assistance booking for {provider.name}?
          </h4>

          <p>
            Our concierge dispatcher can reserve your exact
            time slot or connect you directly with the master
            technician in Panadura within 5 minutes.
          </p>
        </div>

        <div className="dev15-guarantee-actions">
          <button className="dev15-btn-secondary">
            Talk to Concierge
          </button>

          <button className="dev15-btn-primary">
            Reserve Slot (No Fee)
          </button>
        </div>
      </footer>
    </div>
  );
}