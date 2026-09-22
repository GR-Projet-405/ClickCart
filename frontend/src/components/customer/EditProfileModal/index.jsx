import React, { useState } from "react";
import { Camera, Check, ShieldCheck, X } from "lucide-react";
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, avatarUrl: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
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
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-modal__form">
          <div className="edit-profile-modal__avatar-section">
            <div className="edit-profile-modal__avatar-wrap">
              <Avatar
                src={formData.avatarUrl}
                fallback={formData.fullName.slice(0, 2).toUpperCase()}
                size="lg"
              />
              <label className="edit-profile-modal__avatar-btn" title="Upload new photo">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div>
              <strong className="edit-profile-modal__avatar-title">Profile Photo</strong>
              <p className="cc-caption cc-text-secondary">
                Upload a clear portrait. Formats: JPG, PNG, WEBP (Max 5MB).
              </p>
            </div>
          </div>

          <div className="edit-profile-modal__grid">
            <Input
              label="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="e.g. Kasun Perera"
            />

            <Input
              label="Preferred / Display Name"
              name="preferredName"
              value={formData.preferredName}
              onChange={handleChange}
              placeholder="e.g. Kasun"
            />

            <Input
              label="Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g. kasun@example.com"
            />

            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g. +94 77 123 4567"
            />

            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Select>

            <Select
              label="Preferred Language"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
            >
              <option value="English (UK)">English (UK)</option>
              <option value="English (US)">English (US)</option>
              <option value="Sinhala">Sinhala (සිංහල)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
            </Select>

            <Select
              label="Default Currency"
              name="defaultCurrency"
              value={formData.defaultCurrency}
              onChange={handleChange}
            >
              <option value="LKR (Rs.)">LKR (Rs.) - Sri Lankan Rupee</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
            </Select>

            <Input
              label="Primary Region / City"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Colombo, Western Province"
            />

            <Input
              label="Emergency Contact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="e.g. +94 71 987 6543 (Wife)"
            />
          </div>

          <Textarea
            label="Customer Bio / Service Notes"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell service providers about your property, preferred appointment times, or pets..."
            rows={3}
          />

          <div className="cc-modal__footer">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Check size={16} />}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
