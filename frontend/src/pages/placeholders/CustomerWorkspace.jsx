import React from "react";
import { Link, useLocation } from "react-router-dom";
import PageContainer from "../../components/common/PageContainer";
import "./CustomerWorkspace.css";

export default function CustomerWorkspace() {
  const { pathname } = useLocation();
  const pageTitle =
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment) =>
        segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (character) => character.toUpperCase()),
      )
      .join(" / ") || "Home";

  return (
    <PageContainer className="customer-workspace">
      <h1 className="cc-h2">{pageTitle}</h1>
      <p className="cc-body cc-text-secondary">This page is coming soon.</p>
      <Link to="/" className="cc-button cc-button--primary cc-button--md">
        Back to Home
      </Link>
    </PageContainer>
  );
}
