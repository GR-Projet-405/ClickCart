import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  CheckCircle2,
  Mail,
  User,
  Calendar,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Wrench,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  PhoneCall,
  Share2,
} from "lucide-react";
import { getPublicProviderProfile, EMPTY_PROFILE } from "../../../services/providerProfileService";
import Spinner from "../../../components/common/Spinner";
import "./PublicProviderProfile.css";

export default function PublicProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicProfile() {
      try {
        setLoading(true);
        const data = await getPublicProviderProfile(providerId);
        setProfileData(data);
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicProfile();
  }, [providerId]);

  const isIndividual = profileData.providerType === "individual";
  const name = isIndividual
    ? profileData.fullName || "Kasun Perera"
    : profileData.businessName || "Kasun Solutions";

  const location = profileData.location || "Colombo, Sri Lanka";
  const bio =
    profileData.bio ||
    "Professional service provider offering top-tier, reliable electrical and home maintenance services with guaranteed quality, transparent pricing, and punctual execution.";

  const handleBookService = (serviceName) => {
    alert(`Initiating booking for ${serviceName || "service"} with ${name}`);
  };

  const handleMessageProvider = () => {
    alert(`Opening chat with ${name}`);
  };

  const services = [
    {
      id: 1,
      title: "Electrical Maintenance & Repairs",
      category: "Electrical",
      price: "LKR 3,500",
      rating: 4.9,
      reviewsCount: 34,
      icon: Zap,
      description: "Comprehensive diagnostics, wiring repairs, circuit breaker replacement, and electrical safety inspections.",
    },
    {
      id: 2,
      title: "Full House Wiring & Appliance Setup",
      category: "Installation",
      price: "LKR 6,000",
      rating: 4.8,
      reviewsCount: 18,
      icon: Wrench,
      description: "Complete residential wiring setup, socket installations, lighting fixtures, and high-power appliance configuration.",
    },
  ];

  const customerReviews = [
    {
      id: 1,
      name: "Nimna Silva",
      date: "2 days ago",
      rating: 5,
      comment: "Extremely professional and punctual! Solved our electrical issue in under an hour. Clean work and highly recommended.",
      verified: true,
      serviceUsed: "Electrical Maintenance & Repairs",
    },
    {
      id: 2,
      name: "Dinesh Rajapaksha",
      date: "1 week ago",
      rating: 5,
      comment: "Great experience! Came prepared with all tools and replacement parts. Fair pricing with clear explanation of the work done.",
      verified: true,
      serviceUsed: "Full House Wiring & Appliance Setup",
    },
    {
      id: 3,
      name: "Anusha Fernando",
      date: "3 weeks ago",
      rating: 4,
      comment: "Very knowledgeable and friendly service. Arrived right on schedule and fixed our master switch.",
      verified: true,
      serviceUsed: "Electrical Maintenance & Repairs",
    },
  ];

  if (loading) {
    return (
      <div className="public-profile-root" style={{ textAlign: "center", padding: "80px 20px" }}>
        <Spinner size="lg" />
        <p style={{ marginTop: 16, color: "var(--cc-text-secondary)" }}>Loading public profile...</p>
      </div>
    );
  }

  return (
    <div className="public-profile-root">
      {/* 1. HERO COVER & HEADER SECTION */}
      <div className="profile-hero-wrapper">
        <div className="profile-cover-banner">
          <div className="cover-pattern-overlay" />
          <div className="cover-badge-top">
            <Sparkles size={14} /> ClickCart Verified Professional
          </div>
        </div>

        <div className="profile-hero-content">
          <div className="hero-profile-avatar-box">
            {profileData.imagePreview ? (
              <img
                src={profileData.imagePreview}
                alt={name}
                className="hero-avatar-image"
              />
            ) : (
              <div className="hero-avatar-fallback">
                <User size={44} />
              </div>
            )}
            <span className="online-indicator" title="Available for bookings" />
          </div>

          <div className="hero-info-column">
            <div className="hero-title-row">
              <h1 className="hero-name">{name}</h1>
              <span className="verified-chip">
                <CheckCircle2 size={15} /> Verified
              </span>
              <span className="type-chip">
                {isIndividual ? "Individual Provider" : "Registered Business"}
              </span>
            </div>

            <div className="hero-meta-bar">
              <div className="meta-pill">
                <Star size={16} className="star-icon" fill="#f5a623" />
                <span className="rating-num">4.9</span>
                <span className="rating-count">(48 reviews)</span>
              </div>
              <span className="meta-dot">•</span>
              <div className="meta-pill">
                <MapPin size={16} className="meta-icon" />
                <span>{location}</span>
              </div>
              <span className="meta-dot">•</span>
              <div className="meta-pill">
                <Calendar size={16} className="meta-icon" />
                <span>Member since Jan 2024</span>
              </div>
            </div>

            <p className="hero-bio-short">{bio}</p>

            {/* Quick Metrics Bar */}
            <div className="metrics-cards-row">
              <div className="metric-box">
                <div className="metric-icon-wrap">
                  <Award size={18} />
                </div>
                <div className="metric-text">
                  <span className="metric-val">99%</span>
                  <span className="metric-lbl">Job Completion</span>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon-wrap">
                  <Clock size={18} />
                </div>
                <div className="metric-text">
                  <span className="metric-val">&lt; 15 mins</span>
                  <span className="metric-lbl">Avg. Response Time</span>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon-wrap">
                  <ThumbsUp size={18} />
                </div>
                <div className="metric-text">
                  <span className="metric-val">50+</span>
                  <span className="metric-lbl">Completed Orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs Box */}
          <div className="hero-actions-box">
            <button
              className="pub-btn pub-btn--primary"
              onClick={() => handleBookService("Featured Service")}
            >
              <Zap size={18} />
              <span>Book Service</span>
            </button>
            <button
              className="pub-btn pub-btn--secondary"
              onClick={handleMessageProvider}
            >
              <MessageSquare size={18} />
              <span>Message Provider</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="profile-tabs-bar">
        <div className="tabs-container">
          <button
            className={`tab-item ${activeTab === "overview" ? "tab-item--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview &amp; Services
          </button>
          <button
            className={`tab-item ${activeTab === "reviews" ? "tab-item--active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews (48)
          </button>
          <button
            className={`tab-item ${activeTab === "coverage" ? "tab-item--active" : ""}`}
            onClick={() => setActiveTab("coverage")}
          >
            Service Areas
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="profile-body-container">
        {/* TAB 1: OVERVIEW & SERVICES */}
        {(activeTab === "overview" || activeTab === "all") && (
          <div className="tab-section">
            {/* About Card */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">About Me</h2>
              </div>
              <p className="about-full-text">{bio}</p>

              <div className="about-highlights-flex">
                <div className="highlight-pill">
                  <ShieldCheck size={18} className="pill-icon" />
                  <div>
                    <span className="pill-title">Background Checked</span>
                    <span className="pill-desc">Identity &amp; credentials verified</span>
                  </div>
                </div>

                <div className="highlight-pill">
                  <Clock size={18} className="pill-icon" />
                  <div>
                    <span className="pill-title">Punctual &amp; Reliable</span>
                    <span className="pill-desc">Guaranteed on-time arrival</span>
                  </div>
                </div>

                <div className="highlight-pill">
                  <Award size={18} className="pill-icon" />
                  <div>
                    <span className="pill-title">Quality Assured</span>
                    <span className="pill-desc">100% Satisfaction guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered Card */}
            <div className="content-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Services Offered</h2>
                  <p className="card-subtitle">Select a service to request a quote or book directly</p>
                </div>
              </div>

              <div className="services-grid">
                {services.map((srv) => {
                  const IconComp = srv.icon;
                  return (
                    <div className="service-card-modern" key={srv.id}>
                      <div className="service-header-row">
                        <div className="service-icon-box">
                          <IconComp size={24} />
                        </div>
                        <div className="service-rating-badge">
                          <Star size={14} fill="#f5a623" color="#f5a623" />
                          <span>{srv.rating}</span>
                          <span className="rev-count">({srv.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="service-title">{srv.title}</h3>
                      <p className="service-desc">{srv.description}</p>

                      <div className="service-footer-row">
                        <div className="service-price-block">
                          <span className="price-label">Starting from</span>
                          <span className="price-amount">{srv.price}</span>
                        </div>

                        <button
                          className="service-book-btn"
                          onClick={() => handleBookService(srv.title)}
                        >
                          <span>Book Now</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {(activeTab === "reviews" || activeTab === "all" || activeTab === "overview") && (
          <div className="tab-section">
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Customer Reviews &amp; Ratings</h2>
              </div>

              <div className="reviews-summary-grid">
                {/* Big Score Box */}
                <div className="score-summary-box">
                  <span className="score-number">4.9</span>
                  <div className="stars-row">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill="#f5a623" color="#f5a623" />
                    ))}
                  </div>
                  <span className="score-subtext">Based on 48 customer reviews</span>
                </div>

                {/* Rating Bar Chart */}
                <div className="bars-summary-box">
                  <div className="bar-row">
                    <span>5 ★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: "90%" }} />
                    </div>
                    <span>90%</span>
                  </div>
                  <div className="bar-row">
                    <span>4 ★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: "8%" }} />
                    </div>
                    <span>8%</span>
                  </div>
                  <div className="bar-row">
                    <span>3 ★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: "2%" }} />
                    </div>
                    <span>2%</span>
                  </div>
                  <div className="bar-row">
                    <span>2 ★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: "0%" }} />
                    </div>
                    <span>0%</span>
                  </div>
                  <div className="bar-row">
                    <span>1 ★</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: "0%" }} />
                    </div>
                    <span>0%</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                {customerReviews.map((rev) => (
                  <div className="review-card-item" key={rev.id}>
                    <div className="review-item-header">
                      <div className="reviewer-avatar">
                        {rev.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="reviewer-info">
                        <div className="reviewer-name-row">
                          <span className="reviewer-name">{rev.name}</span>
                          {rev.verified && (
                            <span className="verified-buyer-tag">
                              <CheckCircle2 size={12} /> Verified Customer
                            </span>
                          )}
                        </div>
                        <span className="review-date">{rev.date} • {rev.serviceUsed}</span>
                      </div>

                      <div className="review-stars-right">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#f5a623" color="#f5a623" />
                        ))}
                      </div>
                    </div>

                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE AREA */}
        {(activeTab === "coverage" || activeTab === "all" || activeTab === "overview") && (
          <div className="tab-section">
            <div className="content-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Service Areas &amp; Coverage</h2>
                  <p className="card-subtitle">Primary operational regions and surrounding neighborhoods</p>
                </div>
              </div>

              <div className="coverage-content-grid">
                <div className="map-visual-card">
                  <svg
                    className="map-svg-element"
                    viewBox="0 0 320 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="320" height="200" fill="#F1F5F9" />
                    <path
                      d="M 0 140 C 60 110, 120 180, 200 140 C 260 110, 300 170, 320 150 L 320 200 L 0 200 Z"
                      fill="#E2E8F0"
                    />
                    <path d="M 50 0 L 260 200" stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />
                    <path d="M 0 70 Q 160 40 320 100" stroke="#FFFFFF" strokeWidth="6" opacity="0.9" />
                    <path d="M 160 0 L 160 200" stroke="#FFFFFF" strokeWidth="5" opacity="0.9" />
                    <circle cx="160" cy="100" r="55" fill="#10B926" fillOpacity="0.16" stroke="#10B926" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>
                  <div className="map-pin-box">
                    <MapPin size={34} className="pin-pulse-icon" />
                    <span className="pin-title-badge">{location} &amp; Suburbs</span>
                  </div>
                </div>

                <div className="coverage-details-column">
                  <h3 className="coverage-subhead">Supported Locations</h3>
                  <div className="location-tags-grid">
                    <div className="loc-tag"><MapPin size={14} /> Colombo 1-15</div>
                    <div className="loc-tag"><MapPin size={14} /> Sri Jayawardenepura Kotte</div>
                    <div className="loc-tag"><MapPin size={14} /> Dehiwala - Mount Lavinia</div>
                    <div className="loc-tag"><MapPin size={14} /> Rajagiriya &amp; Battaramulla</div>
                    <div className="loc-tag"><MapPin size={14} /> Nugegoda &amp; Maharagama</div>
                    <div className="loc-tag"><MapPin size={14} /> Nawala &amp; Kirulapone</div>
                  </div>

                  <div className="travel-note">
                    <ShieldCheck size={18} className="note-icon" />
                    <span>Free travel within 15 km radius of primary location.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
