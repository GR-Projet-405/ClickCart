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
  AlertCircle,
} from "lucide-react";
import { getPublicProviderProfile, EMPTY_PROFILE } from "../../../services/providerProfileService";
import { providerServicesApi } from "../../../services/providerServices";
import { fetchProviderReviews, fetchProviderRatingSummary } from "../../../services/reviewService";
import { fetchServiceAreas } from "../../../services/serviceAreaApi";
import Spinner from "../../../components/common/Spinner";
import "./PublicProviderProfile.css";

export default function PublicProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Core Provider Profile State
  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);

  // Services State
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  // Reviews & Rating Summary State
  const [reviewsList, setReviewsList] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  // Service Areas State
  const [serviceAreasList, setServiceAreasList] = useState([]);
  const [serviceAreasLoading, setServiceAreasLoading] = useState(true);
  const [serviceAreasError, setServiceAreasError] = useState(null);

  useEffect(() => {
    if (!providerId) return;

    // 1. Fetch Provider Profile
    async function loadProfile() {
      try {
        setProfileLoading(true);
        const data = await getPublicProviderProfile(providerId);
        setProfileData(data);
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }

    // 2. Fetch Provider Services
    async function loadServices() {
      try {
        setServicesLoading(true);
        setServicesError(null);
        const response = await providerServicesApi.list(providerId);
        const list = Array.isArray(response) ? response : response?.content || [];
        setServicesList(list);
      } catch (err) {
        console.error("Error loading provider services:", err);
        setServicesError("Failed to load services for this provider.");
        setServicesList([]);
      } finally {
        setServicesLoading(false);
      }
    }

    // 3. Fetch Provider Reviews & Rating Summary
    async function loadReviews() {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const [reviewsRes, summaryRes] = await Promise.allSettled([
          fetchProviderReviews(providerId),
          fetchProviderRatingSummary(providerId),
        ]);

        if (reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value)) {
          setReviewsList(reviewsRes.value);
        } else {
          setReviewsList([]);
        }

        if (summaryRes.status === "fulfilled" && summaryRes.value) {
          setRatingSummary(summaryRes.value);
        } else {
          setRatingSummary(null);
        }
      } catch (err) {
        console.error("Error loading provider reviews:", err);
        setReviewsError("Failed to load reviews for this provider.");
        setReviewsList([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    // 4. Fetch Provider Service Areas
    async function loadServiceAreas() {
      try {
        setServiceAreasLoading(true);
        setServiceAreasError(null);
        const data = await fetchServiceAreas({ size: 50 });
        const list = Array.isArray(data) ? data : data?.content || [];
        // Filter by providerId if attribute present in service area response
        const filtered = list.filter((item) => !item.providerId || item.providerId === providerId);
        setServiceAreasList(filtered.length > 0 ? filtered : list);
      } catch (err) {
        console.error("Error loading service areas:", err);
        setServiceAreasError("Unable to load detailed coverage areas.");
        setServiceAreasList([]);
      } finally {
        setServiceAreasLoading(false);
      }
    }

    loadProfile();
    loadServices();
    loadReviews();
    loadServiceAreas();
  }, [providerId]);

  const isIndividual = profileData.providerType === "individual";
  const name = isIndividual
    ? profileData.fullName || "Provider Profile"
    : profileData.businessName || "Business Profile";

  const location = profileData.location || "Location not specified";
  const bio =
    profileData.bio ||
    "No bio description provided yet for this service provider.";

  const handleBookService = (serviceName) => {
    alert(`Initiating booking for ${serviceName || "service"} with ${name}`);
  };

  const handleMessageProvider = () => {
    alert(`Opening chat with ${name}`);
  };

  // Derived rating numbers from real summary API
  const avgRating = ratingSummary?.averageRating
    ? Number(ratingSummary.averageRating).toFixed(1)
    : "0.0";
  const totalRevCount = ratingSummary?.totalReviews ?? reviewsList.length;
  const ratingDist = ratingSummary?.distribution || {};

  // Maximum radius from real service area API
  const maxRadiusKm = serviceAreasList.reduce(
    (max, item) => (item.radiusKm && item.radiusKm > max ? item.radiusKm : max),
    0
  );

  if (profileLoading) {
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
                <span className="rating-num">{avgRating}</span>
                <span className="rating-count">({totalRevCount} reviews)</span>
              </div>
              <span className="meta-dot">•</span>
              <div className="meta-pill">
                <MapPin size={16} className="meta-icon" />
                <span>{location}</span>
              </div>
              <span className="meta-dot">•</span>
              <div className="meta-pill">
                <Calendar size={16} className="meta-icon" />
                <span>Profile Active</span>
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
                  <span className="metric-val">{servicesList.length}</span>
                  <span className="metric-lbl">Services Listed</span>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon-wrap">
                  <Clock size={18} />
                </div>
                <div className="metric-text">
                  <span className="metric-val">{totalRevCount}</span>
                  <span className="metric-lbl">Total Reviews</span>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon-wrap">
                  <ThumbsUp size={18} />
                </div>
                <div className="metric-text">
                  <span className="metric-val">{avgRating} ★</span>
                  <span className="metric-lbl">Overall Rating</span>
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
            Overview &amp; Services ({servicesList.length})
          </button>
          <button
            className={`tab-item ${activeTab === "reviews" ? "tab-item--active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({totalRevCount})
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

              {servicesLoading ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <Spinner size="md" />
                  <p style={{ marginTop: 8, color: "var(--cc-text-secondary)" }}>Loading services...</p>
                </div>
              ) : servicesError ? (
                <div style={{ padding: 16, backgroundColor: "var(--cc-error-soft)", color: "var(--cc-error-text)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={18} />
                  <span>{servicesError}</span>
                </div>
              ) : servicesList.length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--cc-text-secondary)" }}>
                  <p>No services listed yet by this provider.</p>
                </div>
              ) : (
                <div className="services-grid">
                  {servicesList.map((srv) => {
                    const priceDisplay = srv.priceFrom != null
                      ? (srv.priceTo ? `LKR ${srv.priceFrom} - ${srv.priceTo}` : `LKR ${srv.priceFrom}`)
                      : "Price on request";
                    return (
                      <div className="service-card-modern" key={srv.id || srv.title}>
                        <div className="service-header-row">
                          <div className="service-icon-box">
                            {srv.category === "Electrical" ? <Zap size={24} /> : <Wrench size={24} />}
                          </div>
                          <div className="service-rating-badge">
                            <Star size={14} fill="#f5a623" color="#f5a623" />
                            <span>{avgRating}</span>
                          </div>
                        </div>

                        <h3 className="service-title">{srv.title}</h3>
                        <p className="service-desc">{srv.description || "No description provided."}</p>

                        <div className="service-footer-row">
                          <div className="service-price-block">
                            <span className="price-label">Starting from</span>
                            <span className="price-amount">{priceDisplay}</span>
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
              )}
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

              {reviewsLoading ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <Spinner size="md" />
                  <p style={{ marginTop: 8, color: "var(--cc-text-secondary)" }}>Loading reviews...</p>
                </div>
              ) : (
                <>
                  <div className="reviews-summary-grid">
                    {/* Big Score Box */}
                    <div className="score-summary-box">
                      <span className="score-number">{avgRating}</span>
                      <div className="stars-row">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < Math.round(Number(avgRating)) ? "#f5a623" : "none"}
                            color="#f5a623"
                          />
                        ))}
                      </div>
                      <span className="score-subtext">Based on {totalRevCount} customer reviews</span>
                    </div>

                    {/* Rating Bar Chart */}
                    <div className="bars-summary-box">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingDist[star] || ratingDist[String(star)] || 0;
                        const pct = totalRevCount > 0 ? Math.round((count / totalRevCount) * 100) : 0;
                        return (
                          <div className="bar-row" key={star}>
                            <span>{star} ★</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {reviewsError ? (
                    <div style={{ padding: 16, backgroundColor: "var(--cc-error-soft)", color: "var(--cc-error-text)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
                      <AlertCircle size={18} />
                      <span>{reviewsError}</span>
                    </div>
                  ) : reviewsList.length === 0 ? (
                    <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--cc-text-secondary)" }}>
                      <p>No customer reviews yet for this provider.</p>
                    </div>
                  ) : (
                    /* Reviews List */
                    <div className="reviews-list">
                      {reviewsList.map((rev, index) => {
                        const displayName = rev.customerId
                          ? `Customer (${rev.customerId.substring(0, 6)})`
                          : "Customer";
                        const formattedDate = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString()
                          : "Recent";
                        return (
                          <div className="review-card-item" key={rev.id || index}>
                            <div className="review-item-header">
                              <div className="reviewer-avatar">
                                {displayName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="reviewer-info">
                                <div className="reviewer-name-row">
                                  <span className="reviewer-name">{displayName}</span>
                                  {rev.verifiedBooking && (
                                    <span className="verified-buyer-tag">
                                      <CheckCircle2 size={12} /> Verified Customer
                                    </span>
                                  )}
                                </div>
                                <span className="review-date">{formattedDate}</span>
                              </div>

                              <div className="review-stars-right">
                                {[...Array(rev.rating || 5)].map((_, i) => (
                                  <Star key={i} size={14} fill="#f5a623" color="#f5a623" />
                                ))}
                              </div>
                            </div>

                            <p className="review-comment">{rev.content || "No review comment."}</p>
                            {rev.providerResponse && (
                              <div style={{ marginTop: 12, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6, fontSize: "0.85rem", borderLeft: "3px solid var(--cc-primary)" }}>
                                <strong>Provider Response:</strong> {rev.providerResponse}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
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
                    <span className="pin-title-badge">{location} &amp; Surrounds</span>
                  </div>
                </div>

                <div className="coverage-details-column">
                  <h3 className="coverage-subhead">Supported Locations</h3>
                  {serviceAreasLoading ? (
                    <p style={{ color: "var(--cc-text-secondary)", fontSize: "0.9rem" }}>Loading service areas...</p>
                  ) : serviceAreasList.length > 0 ? (
                    <div className="location-tags-grid">
                      {serviceAreasList.map((sa, idx) => (
                        <div className="loc-tag" key={sa.id || idx}>
                          <MapPin size={14} />
                          <span>{sa.cityName || sa.locationName || sa.district || location}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="location-tags-grid">
                      <div className="loc-tag">
                        <MapPin size={14} />
                        <span>{location}</span>
                      </div>
                    </div>
                  )}

                  <div className="travel-note">
                    <ShieldCheck size={18} className="note-icon" />
                    <span>
                      {maxRadiusKm > 0
                        ? `Service coverage up to ${maxRadiusKm} km radius from primary location.`
                        : `Service available in ${location} and surrounding areas.`}
                    </span>
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

