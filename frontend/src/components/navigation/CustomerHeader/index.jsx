import React from 'react';
import { useEffect, useState } from "react";
import { Bell, Heart, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../../common/Avatar";
import BrandLogo from "../../common/BrandLogo";
import Button from "../../common/Button";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import { customerNavigation } from "../../../config/customerNavigation";
import { useCustomer } from "../../../context/CustomerContext";
import CustomerMobileNav from "../CustomerMobileNav";
import NavItem from "../NavItem";
import "./styles.css";

export default function CustomerHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, search } = location;
  const { profile, displayName, avatarFallback } = useCustomer();

  const isFavoritesActive =
    pathname === "/customer/profile" &&
    new URLSearchParams(search).get("tab") === "favorites";

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const closeOnEscape = (event) =>
      event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="customer-header">
      <PageContainer className="customer-header__inner">
        <Link
          className="customer-header__brand"
          to="/"
          aria-label="ClickCart home"
        >
          <BrandLogo size="shell" showTagline />
        </Link>
        <nav className="customer-header__nav" aria-label="Customer navigation">
          {customerNavigation.map((item) => (
            <NavItem key={item.label} {...item} active={pathname === item.to} />
          ))}
        </nav>
        <div className="customer-header__actions">
          <IconButton
            className={`customer-header__desktop-action ${
              isFavoritesActive ? "customer-header__action--active" : ""
            }`}
            icon={
              <Heart
                size={18}
                fill={isFavoritesActive ? "#ef4444" : "none"}
                color={isFavoritesActive ? "#ef4444" : "currentColor"}
              />
            }
            label="Favorites & Saved"
            variant="ghost"
            onClick={() => navigate("/customer/profile?tab=favorites")}
          />
          <IconButton
            icon={<Bell size={18} />}
            label="Notifications"
            variant="ghost"
          />
          <Link
            className="customer-header__account"
            to="/customer/profile"
            aria-label="View customer profile"
          >
            <Avatar
              src={profile?.avatarUrl}
              fallback={avatarFallback || "TH"}
              size="sm"
            />
            <span>
              <small>Hello,</small>
              <strong>{displayName || "Tharindu"}</strong>
            </span>
          </Link>
          <Button className="customer-header__cta">Post a Service</Button>
          <IconButton
            className="customer-header__menu"
            icon={menuOpen ? <X size={20} /> : <Menu size={20} />}
            label={menuOpen ? "Close customer menu" : "Open customer menu"}
            variant="ghost"
            aria-expanded={menuOpen}
            aria-controls="customer-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          />
        </div>
      </PageContainer>
      <CustomerMobileNav
        open={menuOpen}
        pathname={pathname}
        onNavigate={() => setMenuOpen(false)}
      />
    </header>
  );
}
