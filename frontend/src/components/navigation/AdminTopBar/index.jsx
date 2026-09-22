import React from 'react';
import { ChevronDown, Globe2, Phone } from "lucide-react";
import PageContainer from "../../common/PageContainer";

export default function AdminTopBar() {
  return (
    <div className="dashboard-topbar">
      <PageContainer className="dashboard-topbar__inner">
        <div className="dashboard-topbar__support">
          <Phone size={13} aria-hidden="true" />
          <span>Need Help?</span>
          <a href="tel:+942538862516">(025) 3886 25 16</a>
        </div>
        <nav
          className="dashboard-topbar__links"
          aria-label="Admin utility navigation"
        >
          <a href="/">Visit Marketplace</a>
          <a href="#help-center">Help Center</a>
          <span>USD</span>
          <button type="button" aria-label="Language: English">
            <Globe2 size={13} aria-hidden="true" />
            <span>Eng</span>
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </nav>
      </PageContainer>
    </div>
  );
}
