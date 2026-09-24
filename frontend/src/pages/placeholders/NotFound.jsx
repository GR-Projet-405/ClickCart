import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>

      <h2>Page Not Found</h2>

      <p>The page you are looking for does not exist.</p>

      <Link
        to="/"
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          textDecoration: "none",
          borderRadius: "8px",
          background: "#2563eb",
          color: "#fff",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}