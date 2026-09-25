import React from "react";
import { Link } from "react-router-dom";

const providerPages = [
  { label: "Provider Home", to: "/provider" },
  { label: "My Jobs", to: "/provider/jobs" },
  { label: "Services", to: "/provider/services" },
  { label: "Bookings", to: "/provider/bookings" },
  { label: "Messages", to: "/provider/messages" },
  { label: "Earnings", to: "/provider/earnings" },
];

export default function CustomerWorkspace() {
  return (
    <div style={{ padding: "32px 20px", display: "grid", gap: "16px" }}>
      <h2 style={{ margin: 0, fontSize: "28px" }}>Temporary Provider Navigation</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {providerPages.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "42px",
              padding: "0 16px",
              borderRadius: "999px",
              background: "#16a34a",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
