import { Bell, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";

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
          <BrandLogo showTagline />
        </Link>
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
            aria-label="Open provider account menu"
          >
            <Avatar fallback="PN" size="sm" online />
            <span className="dashboard-header__identity-copy">
              <small>Hello,</small>
              <strong>Provider Name</strong>
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
