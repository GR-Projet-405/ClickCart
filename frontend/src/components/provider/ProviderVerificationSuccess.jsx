import React from "react";
import { FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ProviderVerificationSuccess() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "60px auto",
        backgroundColor: "#ffffff",
        padding: "40px 32px",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        textAlign: "center",
      }}
    >
      {/* Green Glowing Checkmark Circle */}
      <div
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          backgroundColor: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 0 0 10px #f0fdf4",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#159c2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <FiCheck size={32} strokeWidth={3} />
        </div>
      </div>

      {/* Main Heading */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#000000",
          marginBottom: "16px",
          lineHeight: "1.3",
        }}
      >
        Documents Submitted <br />
        Successfully!
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: "14px",
          color: "#374151",
          lineHeight: "1.6",
          marginBottom: "28px",
          padding: "0 10px",
        }}
      >
        Your Details and Documents have been sent to our administration team
        for review. This process typically takes up to 24-48 hours. We will
        notify you once approved.
      </p>

      {/* Go to Dashboard Button */}
      <button
        type="button"
        onClick={() => navigate("/provider/dashboard")}
        style={{
          backgroundColor: "#159c2b",
          color: "#ffffff",
          border: "none",
          padding: "12px 32px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}