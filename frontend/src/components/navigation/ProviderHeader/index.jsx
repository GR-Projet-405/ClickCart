import React from 'react';
import { Bell, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import SearchInput from "../../common/SearchInput";
import kamalAvatar from "../../../assets/avatar-kamal.jpg";
import { CheckCircle2 } from 'lucide-react';

export default function ProviderHeader({ menuOpen, onMenuToggle }) {
  return (
    <header className="dashboard-header">
      <PageContainer className="dashboard-header__inner">
        <IconButton
          className="dashboard-header__menu"
          icon={<Menu size={20} />}
          label="Open provider navigation"
          variant="ghost"
          aria-expanded={menuOpen}
          aria-controls="provider-mobile-navigation"
          onClick={onMenuToggle}
        />
        <Link
          className="dashboard-header__brand"
          to="/provider"
          aria-label="ClickCart provider home"
        >
          <BrandLogo size="shell" showTagline />
        </Link>
        <div className="dashboard-header__search">
          <SearchInput
            aria-label="Provider workspace search"
            placeholder="Search users, bookings, services, reports..."
          />
        </div>
        <div className="dashboard-header__spacer" />
        <div className="dashboard-header__actions">
          <div style={{ position: "relative" }}>
            <IconButton
              icon={<Bell size={18} />}
              label="Notifications"
              variant="ghost"
            />
            <span
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "8px",
                height: "8px",
                backgroundColor: "#f04438",
                borderRadius: "50%",
                border: "2px solid #fff",
                pointerEvents: "none",
              }}
              aria-label="3 new notifications"
            />
          </div>
          <button
            className="dashboard-header__identity"
            type="button"
            aria-label="Open provider account menu"
          >
            <Avatar src={kamalAvatar} fallback="KP" size="lg" />
            <span className="dashboard-header__identity-copy">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <strong>Kamal Perera</strong>
                <CheckCircle2 size={14} color="#10b926" fill="#10b926" stroke="#ffffff" />
              </span>
              <span style={{ fontSize: "0.75rem", color: "#667085", lineHeight: 1.2 }}>Service Provider</span>
              <span className="dashboard-header__status">
                <span className="dashboard-header__status-dot" />
                Online
              </span>
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
      </PageContainer>
    </header>
  );
}
