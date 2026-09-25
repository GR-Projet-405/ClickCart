import React from 'react';
import { ChevronDown, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../common/PageContainer";
import "./styles.css";

export default function CustomerTopBar() {
  return (
    <div className="customer-topbar">
      <PageContainer className="customer-topbar__inner">
        <div className="customer-topbar__support">
          <Phone size={13} aria-hidden="true" />
          <span>Need Help?</span>
          <a href="tel:+942538862516">(025) 3886 25 16</a>
        </div>
        <nav className="customer-topbar__links" aria-label="Utility navigation">
          <Link to="/provider">Become a Provider</Link>
          <a href="#help-center">Help Center</a>
          <span>LKR</span>
          <button type="button" aria-label="Language: English">
            <span aria-hidden="true">🇱🇰</span>
            <span>Eng</span>
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </nav>
      </PageContainer>
    </div>
  );
}
