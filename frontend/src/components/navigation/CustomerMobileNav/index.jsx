import React from 'react';
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import Avatar from "../../common/Avatar";
import NavItem from "../NavItem";
import { customerNavigation } from "../../../config/customerNavigation";
import "./styles.css";

export default function CustomerMobileNav({
  open,
  pathname,
  onNavigate,
  isAuthenticated,
  user,
  profile,
  onLogout,
}) {
  if (!open) return null;

  const fallbackLetters = (
    profile?.fullName ||
    user?.fullName ||
    "CP"
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav
      id="customer-mobile-navigation"
      className="customer-mobile-nav"
      aria-label="Customer mobile navigation"
    >
      {isAuthenticated && (
        <div className="customer-mobile-nav__profile-box">
          <Avatar
            src={profile?.avatarUrl}
            fallback={fallbackLetters}
            size="md"
          />
          <div className="customer-mobile-nav__profile-details">
            <strong>{profile?.fullName || user?.fullName || "Customer"}</strong>
            <small>{profile?.email || user?.email || ""}</small>
            <Link
              to="/customer/profile"
              className="customer-mobile-nav__profile-link"
              onClick={onNavigate}
            >
              <User size={14} />
              <span>Go to Profile</span>
            </Link>
          </div>
        </div>
      )}

      {customerNavigation.map((item) => (
        <NavItem
          key={item.label}
          {...item}
          active={pathname === item.to}
          onClick={onNavigate}
        />
      ))}

      {isAuthenticated ? (
        <button
          type="button"
          className="customer-mobile-nav__logout"
          onClick={() => {
            onNavigate();
            if (onLogout) onLogout();
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      ) : (
        <div className="customer-mobile-nav__auth">
          <Link
            to="/login"
            className="customer-mobile-nav__auth-btn customer-mobile-nav__auth-btn--login"
            onClick={onNavigate}
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="customer-mobile-nav__auth-btn customer-mobile-nav__auth-btn--register"
            onClick={onNavigate}
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
