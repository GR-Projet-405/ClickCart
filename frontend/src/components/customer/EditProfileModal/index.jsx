import React, { useState, useEffect } from "react";
import { AlertCircle, Camera, Check, Loader2, X } from "lucide-react";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Textarea from "../../common/Textarea";
import Avatar from "../../common/Avatar";
import "./styles.css";

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    fullName: "",
    preferredName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    preferredLanguage: "English (UK)",
    defaultCurrency: "LKR (Rs.)",
    timezone: "Asia/Colombo (GMT+5:30)",
    location: "",
    emergencyContact: "",
    bio: "",
    avatarUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        fullName: profile.fullName || "",
        preferredName: profile.preferredName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "Male",
        preferredLanguage: profile.preferredLanguage || "English (UK)",
        defaultCurrency: profile.defaultCurrency || "LKR (Rs.)",
        timezone: profile.timezone || "Asia/Colombo (GMT+5:30)",
        location: profile.location || "",
        emergencyContact: profile.emergencyContact || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
      setErrors({});
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [profile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Image size cannot exceed 5MB",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, avatarUrl: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Full name validation
    const trimmedName = formData.fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Full name is required";
    } else if (trimmedName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    } else if (trimmedName.length > 100) {
      newErrors.fullName = "Full name cannot exceed 100 characters";
    }

    // 2. Email validation
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g. user@example.com)";
    } else if (trimmedEmail.length > 150) {
      newErrors.email = "Email cannot exceed 150 characters";
    }

    // 3. Phone number validation
    const trimmedPhone = formData.phone.trim();
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    const digitCount = trimmedPhone.replace(/\D/g, "").length;
    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(trimmedPhone) || digitCount < 7 || digitCount > 15) {
      newErrors.phone = "Please enter a valid phone number (e.g. +94 77 123 4567)";
    }

    // 4. Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const minDate = new Date("1900-01-01");
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      } else if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else if (birthDate < minDate) {
        newErrors.dateOfBirth = "Please enter a valid date of birth (after 1900)";
      }
    }

    // 5. Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Optional field length limits
    if (formData.preferredName && formData.preferredName.length > 50) {
      newErrors.preferredName = "Preferred name cannot exceed 50 characters";
    }
    if (formData.location && formData.location.length > 150) {
      newErrors.location = "Location cannot exceed 150 characters";
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        fullName: formData.fullName.trim(),
        preferredName: formData.preferredName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        emergencyContact: formData.emergencyContact.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Save profile error:", err);
      setApiError(err.message || "Failed to save profile changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setApiError(null);
    onClose();
  };

  return (
    <div className="cc-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cc-modal edit-profile-modal">
        <div className="cc-modal__header">
          <div>
            <h2 className="cc-h3 cc-modal__title">Edit Customer Profile</h2>
            <p className="cc-caption cc-text-secondary">
              Update your personal credentials, contact info, and preferences.
            </p>
          </div>
          <button
            type="button"
            className="cc-modal__close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {apiError && (
          <div className="edit-profile-modal__api-error" role="alert">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-modal__form">
          <div className="edit-profile-modal__avatar-section">
            <div className="edit-profile-modal__avatar-wrap">
              <Avatar
                src={formData.avatarUrl}
                fallback={(formData.fullName || "CP").slice(0, 2).toUpperCase()}
                size="lg"
              />
              <label className="edit-profile-modal__avatar-btn" title="Upload new photo">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  style={{ display: "none" }}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            <div>
              <strong className="edit-profile-modal__avatar-title">Profile Photo</strong>
              <p className="cc-caption cc-text-secondary">
                Upload a clear portrait. Formats: JPG, PNG, WEBP (Max 5MB).
              </p>
              {errors.avatar && (
                <span className="edit-profile-modal__field-error">{errors.avatar}</span>
              )}
            </div>
          </div>

          <div className="edit-profile-modal__grid">
            {/* 1. Full Name */}
            <Input
              label="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="e.g. Kasun Perera"
              disabled={isSubmitting}
              maxLength={100}
            />

            {/* Preferred / Display Name */}
            <Input
              label="Preferred / Display Name"
              name="preferredName"
              value={formData.preferredName}
              onChange={handleChange}
              error={errors.preferredName}
              placeholder="e.g. Kasun"
              disabled={isSubmitting}
              maxLength={50}
            />

            {/* 2. Email */}
            <Input
              label="Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. kasun@example.com"
              disabled={isSubmitting}
              maxLength={150}
            />

            {/* 3. Phone Number */}
            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. +94 77 123 4567"
              disabled={isSubmitting}
              maxLength={20}
            />

            {/* 4. Date of Birth */}
            <Input
              label="Date of Birth *"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              disabled={isSubmitting}
            />

            {/* 5. Gender */}
            <Select
              label="Gender *"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              disabled={isSubmitting}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </Select>

            {/* Preferred Language */}
            <Select
              label="Preferred Language"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="English (UK)">English (UK)</option>
              <option value="English (US)">English (US)</option>
              <option value="Sinhala">Sinhala (සිංහල)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
            </Select>

            {/* Default Currency */}
            <Select
              label="Default Currency"
              name="defaultCurrency"
              value={formData.defaultCurrency}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="LKR (Rs.)">LKR (Rs.) - Sri Lankan Rupee</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
            </Select>

            {/* Primary Region / Location */}
            <Input
              label="Primary Region / City"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="e.g. Colombo, Western Province"
              disabled={isSubmitting}
              maxLength={150}
            />

            {/* Emergency Contact */}
            <Input
              label="Emergency Contact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="e.g. +94 71 987 6543 (Wife)"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <Textarea
            label="Customer Bio / Service Notes"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            error={errors.bio}
            placeholder="Tell service providers about your property, preferred appointment times, or pets..."
            rows={3}
            disabled={isSubmitting}
            maxLength={500}
          />

          <div className="cc-modal__footer">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 size={16} className="edit-profile-modal__spinner" />
                ) : (
                  <Check size={16} />
                )
              }
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
