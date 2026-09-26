import React from "react";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit3,
  Globe,
  HeartHandshake,
  Languages,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import "./styles.css";

export default function PersonalInfoSection({ profile, onEdit }) {
  const infoItems = [
    {
      label: "Full Name",
      value: profile?.fullName || "Not provided",
      icon: User,
    },
    {
      label: "Preferred Name",
      value: profile?.preferredName || profile?.fullName?.split(" ")[0] || "Not provided",
      icon: User,
    },
    {
      label: "Email Address",
      value: profile?.email || "Not provided",
      icon: Mail,
      verified: profile?.verification?.emailVerified,
    },
    {
      label: "Mobile Number",
      value: profile?.phone || "Not provided",
      icon: Phone,
      verified: profile?.verification?.phoneVerified,
    },
    {
      label: "Date of Birth",
      value: profile?.dateOfBirth
        ? (() => {
          const parts = profile.dateOfBirth.split("-");
          if (parts.length === 3) {
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            return d.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
          return profile.dateOfBirth;
        })()
        : "Not provided",
      icon: Calendar,
    },
    {
      label: "Gender",
      value: profile?.gender || "Not specified",
      icon: User,
    },
    {
      label: "Preferred Language",
      value: profile?.preferredLanguage || "English (UK)",
      icon: Languages,
    },
    {
      label: "Default Currency",
      value: profile?.defaultCurrency || "LKR (Rs.)",
      icon: DollarSign,
    },
    {
      label: "Time Zone",
      value: profile?.timezone || "Asia/Colombo (GMT+5:30)",
      icon: Globe,
    },
    {
      label: "Primary Region",
      value: profile?.location || "Not specified",
      icon: MapPin,
    },
    {
      label: "Emergency Contact",
      value: profile?.emergencyContact || "Not provided",
      icon: HeartHandshake,
    },
  ];

  return (
    <Card className="personal-info-card">
      <div className="personal-info-card__header">
        <div>
          <h2 className="cc-h3 personal-info-card__title">Personal Information</h2>
          <p className="cc-caption cc-text-secondary">
            Manage your personal identity, contact details, and account localization.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Edit3 size={15} />}
          onClick={onEdit}
        >
          Edit Details
        </Button>
      </div>

      <div className="personal-info-card__grid">
        {infoItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="personal-info-card__item">
              <span className="personal-info-card__item-icon">
                <Icon size={16} />
              </span>
              <div className="personal-info-card__item-content">
                <span className="personal-info-card__item-label">
                  {item.label}
                </span>
                <div className="personal-info-card__item-val-row">
                  <strong className="personal-info-card__item-val">
                    {item.value}
                  </strong>
                  {item.verified && (
                    <Badge variant="success" className="personal-info-card__badge">
                      <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {profile?.bio && (
        <div className="personal-info-card__bio-box">
          <span className="personal-info-card__bio-label">
            Customer Notes & Bio
          </span>
          <p className="personal-info-card__bio-text">{profile.bio}</p>
        </div>
      )}
    </Card>
  );
}
