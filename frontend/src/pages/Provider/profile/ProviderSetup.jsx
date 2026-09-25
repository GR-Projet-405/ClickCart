import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Upload, User, X, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import { getProviderProfile, saveProviderProfile } from "../../../services/providerProfileService";
import "./ProviderSetup.css";

export default function ProviderSetup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
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
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Load existing profile data on mount to allow continuing setup
  useEffect(() => {
    const existing = getProviderProfile();
    if (existing) {
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
      // If basic info is complete, start on Step 2 if user is continuing setup
      if (existing.status === "PARTIALLY_COMPLETED") {
        setCurrentStep(2);
      }
    }
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

  const handleTypeChange = (type) => {
    setProviderType(type);
    setErrors({});
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

  const validateStep1 = () => {
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

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.location.trim()) {
      newErrors.location = "Primary location or business address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      // Save partial progress
      saveProviderProfile({
        ...formData,
        providerType,
        imagePreview,
        status: "PARTIALLY_COMPLETED",
      });
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(1);
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === 1) {
      setCurrentStep(1);
    } else if (targetStep === 2) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextFromStep1();
      return;
    }

    if (validateStep2()) {
      saveProviderProfile({
        ...formData,
        providerType,
        imagePreview,
        status: "COMPLETED",
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        navigate("/provider/profile");
      }, 1000);
    }
  };

  const handleCancel = () => {
    navigate("/provider/profile");
  };

  return (
    <div className="provider-setup-container">
      {/* Header */}
      <div className="provider-setup-header">
        <button
          type="button"
          className="edit-profile-back-btn"
          style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--cc-text-secondary)" }}
          onClick={handleCancel}
        >
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </button>
        <h1 className="provider-setup-title">Set Up Your Provider Profile</h1>
        <p className="provider-setup-subtitle">
          Complete your profile so customers can learn more about you and your services.
        </p>
      </div>

      {/* Progress Indicator (2 Steps) */}
      <div className="provider-setup-stepper">
        <button
          type="button"
          className={`stepper-item ${
            currentStep === 1
              ? "stepper-item--active"
              : "stepper-item--completed"
          }`}
          onClick={() => handleStepClick(1)}
        >
          <span className="stepper-badge">1</span>
          <span>Basic Information</span>
        </button>
        <div className="stepper-divider" />
        <button
          type="button"
          className={`stepper-item ${currentStep === 2 ? "stepper-item--active" : ""}`}
          onClick={() => handleStepClick(2)}
        >
          <span className="stepper-badge">2</span>
          <span>Profile Details</span>
        </button>
      </div>

      {/* Main Form Card */}
      <form className="provider-setup-card" onSubmit={handleSubmit} noValidate>
        {submittedSuccess && (
          <div className="success-banner">
            <CheckCircle2 size={20} />
            <span>Profile information saved successfully! Redirecting...</span>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <>
            {/* Provider Type Selection */}
            <div>
              <h2 className="setup-section-title">Select Provider Type</h2>
              <p className="setup-section-subtitle">
                Choose how you will offer your services on ClickCart.
              </p>

              <div className="provider-type-grid">
                <div
                  className={`provider-type-card ${
                    providerType === "individual" ? "provider-type-card--selected" : ""
                  }`}
                  onClick={() => handleTypeChange("individual")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleTypeChange("individual")
                  }
                >
                  <div className="provider-type-icon">
                    <User size={22} />
                  </div>
                  <div className="provider-type-info">
                    <span className="provider-type-title">Individual</span>
                    <span className="provider-type-desc">
                      For providers offering services as an individual.
                    </span>
                  </div>
                  <div className="provider-type-radio">
                    {providerType === "individual" && (
                      <div className="provider-type-radio-inner" />
                    )}
                  </div>
                </div>

                <div
                  className={`provider-type-card ${
                    providerType === "business" ? "provider-type-card--selected" : ""
                  }`}
                  onClick={() => handleTypeChange("business")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleTypeChange("business")
                  }
                >
                  <div className="provider-type-icon">
                    <Building2 size={22} />
                  </div>
                  <div className="provider-type-info">
                    <span className="provider-type-title">Business</span>
                    <span className="provider-type-desc">
                      For registered businesses or service companies.
                    </span>
                  </div>
                  <div className="provider-type-radio">
                    {providerType === "business" && (
                      <div className="provider-type-radio-inner" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information Fields */}
            <div>
              <h2 className="setup-section-title">Basic Information</h2>
              <p className="setup-section-subtitle">
                Enter your contact details accurately so customers can reach you.
              </p>

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

            {/* Step 1 Action Buttons */}
            <div className="setup-actions">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNextFromStep1}
                rightIcon={<ArrowRight size={16} />}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: Profile Details */}
        {currentStep === 2 && (
          <>
            {/* Profile Photo Section */}
            <div>
              <h2 className="setup-section-title">Profile Photo</h2>
              <p className="setup-section-subtitle">
                Upload a photo or business logo to build trust with your customers.
              </p>

              <div className="profile-image-section">
                <div className="profile-avatar-wrapper">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="profile-avatar-img"
                    />
                  ) : (
                    <User size={36} className="profile-avatar-placeholder" />
                  )}
                </div>

                <div className="profile-image-controls">
                  <div className="profile-image-actions">
                    <label className="cc-button cc-button--secondary cc-button--sm">
                      <Upload size={16} style={{ marginRight: 6 }} />
                      <span>Upload Photo</span>
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
                        leftIcon={<X size={16} />}
                      >
                        Remove
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
            </div>

            {/* Profile Details Fields */}
            <div>
              <h2 className="setup-section-title">Profile Details</h2>
              <p className="setup-section-subtitle">
                Add your primary location and a short bio to introduce yourself.
              </p>

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

            {/* Step 2 Action Buttons */}
            <div className="setup-actions">
              <Button
                variant="secondary"
                onClick={handlePrevStep}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back
              </Button>
              <Button variant="primary" type="submit">
                Complete Profile
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
