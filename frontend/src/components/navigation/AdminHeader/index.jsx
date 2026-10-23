import ThemeToggle from "../../common/ThemeToggle";
import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminProfile } from "../../../context/AdminProfileContext";
import { Bell, ChevronDown, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../../common/Avatar";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import SearchInput from "../../common/SearchInput";

/**
 * AdminHeader
 *
 * Props
 * ─────
 * menuOpen          — boolean  Mobile nav drawer open state
 * onMenuToggle      — fn       Toggle mobile nav drawer (mobile only)
 * sidebarCollapsed  — boolean  Desktop sidebar collapsed state
 * onSidebarToggle   — fn       Toggle desktop sidebar collapse
 */
export default function AdminHeader({
  menuOpen,
  onMenuToggle,
  sidebarCollapsed,
  onSidebarToggle,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile } = useAdminProfile();
  const name = profile?.fullName || user?.fullName || "Administrator";

  return (
    <header className="dashboard-header">
      <PageContainer className="dashboard-header__inner">
        {/* Mobile hamburger — visible below lg breakpoint */}
        <IconButton
          className="dashboard-header__menu"
          icon={<Menu size={20} />}
          label="Open admin navigation"
          variant="ghost"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-navigation"
          onClick={onMenuToggle}
        />

        {/* Desktop sidebar collapse toggle — visible at lg+ */}
        {onSidebarToggle && (
          <IconButton
            className="dashboard-header__sidebar-toggle"
            icon={
              sidebarCollapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )
            }
            label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            variant="ghost"
            aria-pressed={sidebarCollapsed}
            onClick={onSidebarToggle}
          />
        )}

        {/* Brand */}
        <Link
          className="dashboard-header__brand"
          to="/admin"
          aria-label="ClickCart admin home"
        >
          <BrandLogo size="shell" showTagline />
        </Link>

        <div className="dashboard-header__spacer" />

        {/* Actions */}
        <div className="dashboard-header__actions">
          <ThemeToggle />
          <button
            className="dashboard-header__identity"
            type="button"
            aria-label="Edit administrator profile"
            onClick={() => navigate("/admin/profile")}
          >
            <Avatar src={profile?.avatar} fallback={name.slice(0,2).toUpperCase()} size="sm" />
            <span className="dashboard-header__identity-copy">
              <small>Hello,</small>
              <strong>{name}</strong>
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <Button variant="outline" size="sm" onClick={async () => { await logout(); navigate("/admin/login", { replace: true }); }}>Sign out</Button>
          <Badge className="dashboard-header__role" variant="primary">
            Platform Admin
          </Badge>
        </div>
      </PageContainer>
    </header>
  );
}
