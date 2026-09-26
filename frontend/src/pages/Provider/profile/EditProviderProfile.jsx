import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Upload,
  User,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Spinner from "../../../components/common/Spinner";
import { getProviderProfile, saveProviderProfile } from "../../../services/providerProfileService";
import "./EditProviderProfile.css";

export default function EditProviderProfile() {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState(null);
  const [providerType, setProviderType] = useState("individual");
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const existing = await getProviderProfile();
        if (existing) {
          if (existing.id) setProfileId(existing.id);
          if (existing.providerType) setProviderType(existing.providerType);
          setFormData({
            fullName: existing.fullName || "",
            businessName: existing.businessName || "",
            contactPerson: existing.contactPerson || "",
            email: existing.email || "",
            phone: existing.phone || "",
            location: existing.location || "",
            bio: existing.bio || "",
          });
          if (existing.imagePreview) {
            setImagePreview(existing.imagePreview);
          }
        }
      } catch (err) {
        console.error("Error loading profile for edit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB.",
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.image;
        return updated;
      });
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (providerType === "individual") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      }
    } else {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required.";
      }
      if (!formData.contactPerson.trim()) {
        newErrors.contactPerson = "Contact person name is required.";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Primary location or business address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSaving(true);
        setSubmitError(null);
        await saveProviderProfile(
          {
            ...formData,
            providerType,
            imagePreview,
          },
          profileId
        );

        setSubmittedSuccess(true);
        setTimeout(() => {
          setSubmittedSuccess(false);
          navigate("/provider/profile");
        }, 1000);
      } catch (err) {
        console.error("Error saving edits:", err);
        setSubmitError("Failed to update profile on backend. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    navigate("/provider/profile");
  };

  if (loading) {
    return (
      <div className="edit-profile-container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <Spinner size="lg" />
        <p style={{ marginTop: 16, color: "var(--cc-text-secondary)" }}>Loading profile form...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      {/* Page Header */}
      <div className="edit-profile-header">
        <button
          type="button"
          className="edit-profile-back-btn"
          onClick={handleCancel}
        >
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </button>
        <h1 className="edit-profile-title">Edit Profile</h1>
        <p className="edit-profile-subtitle">
          Update your provider information and keep your profile up to date.
        </p>
      </div>

      <form className="edit-profile-form" onSubmit={handleSaveChanges} noValidate>
        {submitError && (
          <div style={{ padding: 12, backgroundColor: "var(--cc-error-soft)", color: "var(--cc-error-text)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Success Banner */}
        {submittedSuccess && (
          <div className="success-banner">
            <CheckCircle2 size={20} />
            <span>Profile updated successfully! Redirecting...</span>
          </div>
        )}

        {/* Top Profile Summary Card */}
        <div className="profile-summary-card">
          <div className="profile-summary-main">
            <div className="profile-summary-avatar-wrapper">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Avatar"
                  className="profile-summary-avatar-img"
                />
              ) : (
                <User size={38} className="profile-summary-avatar-placeholder" />
              )}
            </div>

            <div className="profile-summary-details">
              <h2 className="profile-summary-name">
                {providerType === "individual"
                  ? formData.fullName || "Individual Provider"
                  : formData.businessName || "Business Provider"}
              </h2>
              <div className="profile-summary-meta">
                <span className="profile-summary-email">
                  <Mail size={14} />
                  {formData.email || "No email provided"}
                </span>
              </div>
              <div className="profile-badges">
                <span className="provider-type-badge">
                  {providerType === "individual" ? (
                    <>
                      <User size={12} /> Individual Provider
                    </>
                  ) : (
                    <>
                      <Building2 size={12} /> Business Provider
                    </>
                  )}
                </span>
                <span className="profile-status-badge">
                  <ShieldCheck size={12} /> Profile Active
                </span>
              </div>
            </div>
          </div>

          {/* Inline Image Upload / Change Photo Actions */}
          <div className="profile-image-actions-inline">
            <div className="profile-image-btns">
              <label className="cc-button cc-button--secondary cc-button--sm">
                <Upload size={14} style={{ marginRight: 6 }} />
                <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              {imagePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  leftIcon={<X size={14} />}
                >
                  Remove Photo
                </Button>
              )}
            </div>
            <span className="profile-image-hint">
              Recommended: JPG or PNG, up to 5MB.
            </span>
            {errors.image && (
              <span style={{ color: "var(--cc-error)", fontSize: "0.75rem" }}>
                {errors.image}
              </span>
            )}
          </div>
        </div>

        {/* Basic Information Card */}
        <div className="edit-profile-card">
          <div className="card-title-row">
            <div>
              <h3 className="edit-section-title">Basic Information</h3>
              <p className="edit-section-subtitle">
                Manage your primary identification and contact information.
              </p>
            </div>
            <span className="provider-type-badge">
              {providerType === "individual" ? "Individual" : "Business"}
            </span>
          </div>

          <div className="form-grid">
            {providerType === "individual" ? (
              <Input
                id="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                error={errors.fullName}
              />
            ) : (
              <>
                <Input
                  id="businessName"
                  label="Business Name"
                  placeholder="Enter your business name"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                  error={errors.businessName}
                />
                <Input
                  id="contactPerson"
                  label="Contact Person Name"
                  placeholder="Enter contact person name"
                  required
                  value={formData.contactPerson}
                  onChange={(e) =>
                    handleInputChange("contactPerson", e.target.value)
                  }
                  error={errors.contactPerson}
                />
              </>
            )}

            <div className="form-row-2">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
              />
              <Input
                id="phone"
                type="tel"
                label="Phone Number"
                placeholder="+94 XX XXX XXXX"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
              />
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="edit-profile-card">
          <div>
            <h3 className="edit-section-title">Profile Details</h3>
            <p className="edit-section-subtitle">
              Provide location details and a short introduction for your customers.
            </p>
          </div>

          <div className="form-grid">
            <Input
              id="location"
              label="Location / Address"
              placeholder="Enter your primary location or business address"
              helperText="Enter your primary location or business address."
              required
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              error={errors.location}
            />

            <Textarea
              id="bio"
              label="Short Bio"
              placeholder="Tell customers briefly about yourself or your business"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="edit-profile-actions">
          <Button variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving} disabled={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
