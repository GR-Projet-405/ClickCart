import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit3,
  Eye,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Button from "../../../components/common/Button";
import Spinner from "../../../components/common/Spinner";
import {
  getProviderProfile,
  calculateProfileStatus,
  getCompletionPercentage,
  EMPTY_PROFILE,
} from "../../../services/providerProfileService";
import "./ProviderProfileOverview.css";

export default function ProviderProfileOverview() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProviderProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Unable to load profile data from backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("provider_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("provider_profile_updated", handleProfileUpdate);
    };
  }, []);

  const profileStatus = calculateProfileStatus(profile);
  const completionPercentage = getCompletionPercentage(profile);

  const handleStartOrContinueSetup = () => {
    navigate("/provider/profile/setup");
  };

  const handleEditProfile = () => {
    navigate("/provider/profile/edit");
  };

  const handleViewPublicProfile = () => {
    if (profile.id) {
      navigate(`/provider/profile/${profile.id}`);
    } else {
      navigate("/provider/profile/public");
    }
  };

  const isCompleted = profileStatus === "COMPLETED";
  const isPartial = profileStatus === "PARTIALLY_COMPLETED";

  const displayName =
    profile.providerType === "individual"
      ? profile.fullName || "Your Full Name"
      : profile.businessName || "Your Business Name";

  if (loading) {
    return (
      <div className="provider-overview-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <Spinner size="lg" />
        <p style={{ marginTop: 16, color: "var(--cc-text-secondary)" }}>Loading provider profile...</p>
      </div>
    );
  }

  return (
    <div className="provider-overview-container">
      {/* Top Title */}
      <div className="provider-overview-header">
        <div>
          <h1 className="provider-overview-title">Provider Profile</h1>
          <p className="provider-overview-subtitle">
            Manage your service provider details, setup status, and public showcase.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, backgroundColor: "var(--cc-error-soft)", color: "var(--cc-error-text)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={fetchProfile} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* STATE A & STATE B: INCOMPLETE PROFILE (NOT STARTED / PARTIALLY COMPLETED) */}
      {!isCompleted && (
        <div className="setup-status-card">
          <div className="status-card-main">
            <div
              className={`status-card-icon-wrapper ${
                isPartial ? "status-card-icon-wrapper--partial" : ""
              }`}
            >
              {isPartial ? <Clock size={28} /> : <AlertCircle size={28} />}
            </div>

            <div className="status-card-content">
              <div className="status-card-title-row">
                <h2 className="status-card-title">
                  {isPartial
                    ? "Continue Setting Up Your Profile"
                    : "Complete Your Provider Profile"}
                </h2>
                <span
                  className={`status-pill ${
                    isPartial ? "status-pill--partial" : "status-pill--not-started"
                  }`}
                >
                  {isPartial ? `In Progress (${completionPercentage}%)` : "Not Started (0%)"}
                </span>
              </div>

              <p className="status-card-desc">
                Completing your profile helps customers learn about you, your services, and how to reach you on ClickCart.
              </p>

              {/* Dynamic Progress Bar */}
              <div className="profile-progress-block">
                <div className="progress-header">
                  <span>Profile Completion</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="status-card-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartOrContinueSetup}
              rightIcon={<ArrowRight size={18} />}
            >
              {isPartial ? "Continue Setup" : "Complete Profile"}
            </Button>
          </div>
        </div>
      )}

      {/* STATE C: COMPLETED PROFILE OVERVIEW */}
      {isCompleted && (
        <>
          <div className="overview-main-card">
            <div className="overview-avatar-header">
              <div className="overview-avatar-wrapper">
                {profile.imagePreview ? (
                  <img
                    src={profile.imagePreview}
                    alt="Provider Avatar"
                    className="overview-avatar-img"
                  />
                ) : (
                  <User size={48} className="overview-avatar-placeholder" />
                )}
              </div>

              <div className="overview-header-info">
                <div className="overview-name-row">
                  <h2 className="overview-provider-name">{displayName}</h2>
                  <span className="status-pill status-pill--completed">
                    <CheckCircle2 size={14} /> Profile Active
                  </span>
                </div>

                <div className="overview-badges-row">
                  <span className="type-badge">
                    {profile.providerType === "individual" ? (
                      <>
                        <User size={12} /> Individual Provider
                      </>
                    ) : (
                      <>
                        <Building2 size={12} /> Business Provider
                      </>
                    )}
                  </span>
                  <span
                    className="type-badge"
                    style={{
                      backgroundColor: "#eff8ff",
                      color: "#175cd3",
                      borderColor: "#b2ddff",
                    }}
                  >
                    <ShieldCheck size={12} /> Your Profile is Complete
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="overview-actions-row">
                  <Button
                    variant="primary"
                    onClick={handleEditProfile}
                    leftIcon={<Edit3 size={16} />}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleViewPublicProfile}
                    leftIcon={<Eye size={16} />}
                  >
                    View Public Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="overview-details-grid">
              <div className="overview-detail-box">
                <div className="overview-detail-icon">
                  <Mail size={18} />
                </div>
                <div className="overview-detail-text">
                  <span className="overview-detail-label">Email Address</span>
                  <span className="overview-detail-val">{profile.email || "—"}</span>
                </div>
              </div>

              <div className="overview-detail-box">
                <div className="overview-detail-icon">
                  <Phone size={18} />
                </div>
                <div className="overview-detail-text">
                  <span className="overview-detail-label">Phone Number</span>
                  <span className="overview-detail-val">{profile.phone || "—"}</span>
                </div>
              </div>

              <div className="overview-detail-box">
                <div className="overview-detail-icon">
                  <MapPin size={18} />
                </div>
                <div className="overview-detail-text">
                  <span className="overview-detail-label">Primary Location</span>
                  <span className="overview-detail-val">{profile.location || "—"}</span>
                </div>
              </div>

              <div className="overview-detail-box">
                <div className="overview-detail-icon">
                  <FileText size={18} />
                </div>
                <div className="overview-detail-text">
                  <span className="overview-detail-label">Provider Type</span>
                  <span className="overview-detail-val" style={{ textTransform: "capitalize" }}>
                    {profile.providerType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About / Bio Card */}
          {profile.bio && (
            <div className="overview-bio-card">
              <h3 className="overview-bio-title">About / Bio</h3>
              <p className="overview-bio-text">{profile.bio}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
