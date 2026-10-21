import React, { useEffect, useState } from "react";
import { Bell, Heart, Menu, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../../common/Avatar";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import { customerNavigation } from "../../../config/customerNavigation";
import { useAuth, homePathForRole } from "../../../context/AuthContext";
import { useCustomer } from "../../../context/CustomerContext";
import CustomerMobileNav from "../CustomerMobileNav";
import NavItem from "../NavItem";
import "./styles.css";

export default function CustomerHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const { pathname, search } = location;

  const { profile, displayName } = useCustomer();
  const { user, status, logout } = useAuth();

  const isAuthenticated = status === "authenticated" || !!user;

  const isProfileActive =
    pathname === "/customer/profile" || pathname === "/profile";
  const isFavoritesActive =
    pathname === "/favorites" ||
    (pathname === "/customer/profile" &&
      new URLSearchParams(search).get("tab") === "favorites");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to log out:", err);
      navigate("/");
    }
  };

  const customerName =
    profile?.preferredName ||
    profile?.fullName?.split(" ")[0] ||
    user?.fullName?.split(" ")[0] ||
    "Customer";

  const fallbackLetters = (
    profile?.fullName ||
    user?.fullName ||
    displayName ||
    "CP"
  )
    .slice(0, 2)
    .toUpperCase();

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
          {customerNavigation.filter(item => !item.customerOnly || user?.role === "CUSTOMER").map((item) => (
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
            onClick={() => navigate("/favorites")}
          />
          <IconButton
            icon={<Bell size={18} />}
            label="Notifications"
            variant="ghost"
            onClick={() => navigate("/notifications")}
          />

          {isAuthenticated ? (
            <>
              {/* Clean profile icon button directly navigating to /customer/profile */}
              <Link
                to={user?.role === "CUSTOMER" ? "/customer/profile" : homePathForRole(user?.role)}
                className={`customer-header__account ${
                  isProfileActive ? "customer-header__account--active" : ""
                }`}
                title="Open your account"
                aria-label="Open your account"
              >
                <Avatar
                  src={profile?.avatarUrl}
                  fallback={fallbackLetters}
                  size="sm"
                />
                <span className="customer-header__account-text">
                  <small>Hello,</small>
                  <strong>{customerName}</strong>
                </span>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                className="customer-header__signout-btn"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="customer-header__auth-buttons">
              <Link
                to="/login"
                className="customer-header__login-link"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="cc-button cc-button--primary cc-button--md"
              >
                Sign Up
              </Link>
            </div>
          )}

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
        isAuthenticated={isAuthenticated}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
    </header>
  );
}
