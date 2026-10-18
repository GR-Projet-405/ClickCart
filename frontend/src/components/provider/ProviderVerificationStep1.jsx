import React, { useState } from "react";
import { User, CreditCard, MapPin, Phone, Building, FileText, HelpCircle } from "lucide-react";
import { providerVerificationService } from "../../services/providerVerificationService";
import { useAuth } from "../../context/AuthContext";
import "./ProviderVerificationForm.css";

export default function ProviderVerificationStep1({ onNext }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    accountType: "INDIVIDUAL",
    fullName: "",
    nicNumber: "",
    personalAddress: "",
    contactNumber: "",
    businessName: "",
    brnNumber: "",
    businessAddress: "",
    businessContactNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, accountType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userId = "12345";
      if (user) {
        if (typeof user === "string") {
          userId = user;
        } else if (typeof user === "object") {
          userId = user.id || user._id || user.userId || "12345";
        }
      }

      const responseData = await providerVerificationService.saveStepOne(userId, formData);
      const savedUserId = responseData?.userId || responseData?.id || userId;

      if (onNext) onNext(savedUserId, formData.accountType);
    } catch (err) {
      console.error("Save step 1 error:", err);
      setError("Failed to save Step 1 details. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-card">
      <h2 className="verification-title">Provider Verification Form</h2>

      {/* Account Type Toggle */}
      <div className="type-toggle-container">
        <button
          type="button"
          onClick={() => handleTypeSelect("INDIVIDUAL")}
          className={`type-btn ${formData.accountType === "INDIVIDUAL" ? "active" : ""}`}
        >
          Individual
        </button>
        <button
          type="button"
          onClick={() => handleTypeSelect("BUSINESS")}
          className={`type-btn ${formData.accountType === "BUSINESS" ? "active" : ""}`}
        >
          Business
        </button>
      </div>

      {/* Stepper Header */}
      <div className="step-indicator">
        <div className="step-item step-active">
          <span className="step-number">1</span>
        </div>
        <div className="step-line"></div>
        <div className="step-item step-inactive">
          <span className="step-number">2</span>
        </div>
      </div>

      {error && (
        <div style={{ color: "#dc2626", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "18px", color: "#1f2937" }}>
          Account Details & Verification
        </h3>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Dissanayakage Nimal Perera"
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            National ID Number(NIC) <HelpCircle style={{ width: 14, height: 14, color: "#9ca3af" }} />
          </label>
          <div className="input-wrapper">
            <CreditCard className="input-icon" />
            <input
              type="text"
              name="nicNumber"
              value={formData.nicNumber}
              onChange={handleChange}
              placeholder="e.g., 123456789874"
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Personal Address</label>
          <div className="input-wrapper">
            <MapPin className="input-icon" />
            <input
              type="text"
              name="personalAddress"
              value={formData.personalAddress}
              onChange={handleChange}
              placeholder="e.g., No;78, 123 street, colombo 3"
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contact Number</label>
          <div className="input-wrapper">
            <Phone className="input-icon" />
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g., +94 123 456 789"
              required
              className="form-input"
            />
          </div>
        </div>

        {formData.accountType === "BUSINESS" && (
          <>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", marginTop: "24px", color: "#1f2937" }}>
              Business Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <div className="input-wrapper">
                  <Building className="input-icon" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Company Service"
                    required={formData.accountType === "BUSINESS"}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Registration Number(BRN)</label>
                <div className="input-wrapper">
                  <FileText className="input-icon" />
                  <input
                    type="text"
                    name="brnNumber"
                    value={formData.brnNumber}
                    onChange={handleChange}
                    placeholder="e.g., Reg No. 123456"
                    required={formData.accountType === "BUSINESS"}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Business Address</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="e.g., No;78, york street, colombo 5"
                    required={formData.accountType === "BUSINESS"}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Contact Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="text"
                    name="businessContactNumber"
                    value={formData.businessContactNumber}
                    onChange={handleChange}
                    placeholder="e.g., 011 1234 567"
                    required={formData.accountType === "BUSINESS"}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: "28px" }}>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Saving..." : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}