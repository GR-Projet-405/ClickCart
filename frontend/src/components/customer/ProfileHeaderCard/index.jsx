import React, { useRef } from "react";
import {
  Calendar,
  Camera,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Avatar from "../../common/Avatar";
import Badge from "../../common/Badge";
import Button from "../../common/Button";
import "./styles.css";

export default function ProfileHeaderCard({
  profile,
  onEditProfile,
  onAvatarChange,
  onManageAddresses,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && onAvatarChange) {
          onAvatarChange(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-header-card">
      <div className="profile-header-card__banner" />
      <div className="profile-header-card__content">
        <div className="profile-header-card__top">
          <div className="profile-header-card__avatar-area">
            <div className="profile-header-card__avatar-wrapper">
              <Avatar
                src={profile.avatarUrl}
                fallback={profile.fullName.slice(0, 2).toUpperCase()}
                size="lg"
                className="profile-header-card__avatar-img"
              />
              <button
                type="button"
                className="profile-header-card__camera-btn"
                aria-label="Upload profile photo"
                title="Change profile photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <div className="profile-header-card__title-meta">
              <div className="profile-header-card__name-row">
                <h1 className="cc-h2 profile-header-card__name">
                  {profile.fullName}
                </h1>
                <Badge variant="success" className="profile-header-card__verified-badge">
                  <ShieldCheck size={14} />
                  {profile.verification.badgeLabel}
                </Badge>
              </div>
              <p className="profile-header-card__id-tag">
                Customer ID: <code>{profile.id}</code> &bull; Member since {profile.memberSince}
              </p>
            </div>
          </div>

          <div className="profile-header-card__actions">
            <Button
              variant="primary"
              leftIcon={<Edit3 size={16} />}
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              leftIcon={<MapPin size={16} />}
              onClick={onManageAddresses}
            >
              Saved Addresses
            </Button>
          </div>
        </div>

        <div className="profile-header-card__details-strip">
          <div className="profile-header-card__detail-item">
            <Mail size={15} className="profile-header-card__detail-icon" />
            <span className="profile-header-card__detail-label">Email:</span>
            <span className="profile-header-card__detail-val">
              {profile.email}
            </span>
            {profile.verification.emailVerified && (
              <span className="profile-header-card__verified-dot" title="Verified Email">
                <CheckCircle2 size={13} color="var(--cc-success)" />
              </span>
            )}
          </div>

          <div className="profile-header-card__detail-item">
            <Phone size={15} className="profile-header-card__detail-icon" />
            <span className="profile-header-card__detail-label">Phone:</span>
            <span className="profile-header-card__detail-val">
              {profile.phone}
            </span>
            {profile.verification.phoneVerified && (
              <span className="profile-header-card__verified-dot" title="Verified Phone">
                <CheckCircle2 size={13} color="var(--cc-success)" />
              </span>
            )}
          </div>

          <div className="profile-header-card__detail-item">
            <MapPin size={15} className="profile-header-card__detail-icon" />
            <span className="profile-header-card__detail-label">Location:</span>
            <span className="profile-header-card__detail-val">
              {profile.location}
            </span>
          </div>
        </div>

        <div className="profile-header-card__chips-row">
          <div className="profile-header-card__chip">
            <Sparkles size={13} color="var(--cc-primary)" />
            <span>{profile.verification.level}</span>
          </div>
          <div className="profile-header-card__chip">
            <CheckCircle2 size={13} color="var(--cc-success)" />
            <span>National ID Verified</span>
          </div>
          <div className="profile-header-card__chip">
            <CheckCircle2 size={13} color="var(--cc-success)" />
            <span>Payment Method Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
