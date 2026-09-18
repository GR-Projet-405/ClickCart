import { Bell, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import Badge from "../../common/Badge";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import SearchInput from "../../common/SearchInput";

export default function AdminHeader({ menuOpen, onMenuToggle }) {
  return (
    <header className="dashboard-header">
      <PageContainer className="dashboard-header__inner">
        <IconButton
          className="dashboard-header__menu"
          icon={<Menu size={20} />}
          label="Open admin navigation"
          variant="ghost"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-navigation"
          onClick={onMenuToggle}
        />
        <Link
          className="dashboard-header__brand"
          to="/admin"
          aria-label="ClickCart admin home"
        >
          <BrandLogo size="shell" showTagline />
        </Link>
        <div className="dashboard-header__search">
          <SearchInput
            aria-label="Global admin search"
            placeholder="Search users, providers, bookings, reports..."
          />
        </div>
        <div className="dashboard-header__spacer" />
        <div className="dashboard-header__actions">
          <IconButton
            icon={<Bell size={18} />}
            label="Notifications"
            variant="ghost"
          />
          <button
            className="dashboard-header__identity"
            type="button"
            aria-label="Open admin account menu"
          >
            <Avatar fallback="AD" size="sm" />
            <span className="dashboard-header__identity-copy">
              <small>Hello,</small>
              <strong>Admin</strong>
            </span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <Badge className="dashboard-header__role" variant="primary">
            Platform Admin
          </Badge>
        </div>
      </PageContainer>
    </header>
  );
}
