import ThemeToggle from "../../common/ThemeToggle";
import { Bell, Menu, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Avatar from "../../common/Avatar";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import { useProvider } from "../../../context/ProviderContext";
import { useAuth } from "../../../context/AuthContext";
export default function ProviderHeader({ menuOpen, onMenuToggle }) {
  const { profile, displayName } = useProvider();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  async function signOut() {
    setSigningOut(true);
    try { await logout(); } catch { /* Local session is cleared even if the server is unavailable. */ }
    navigate("/login", { replace: true });
  }
  return (
    <header className="dashboard-header">
      <PageContainer className="dashboard-header__inner">
        <IconButton className="dashboard-header__menu" icon={<Menu size={20} />} label="Open provider navigation"
          variant="ghost" aria-expanded={menuOpen} aria-controls="provider-mobile-navigation" onClick={onMenuToggle} />
        <Link className="dashboard-header__brand" to="/provider" aria-label="ClickCart provider home"><BrandLogo size="shell" showTagline /></Link>
        <div className="dashboard-header__spacer" />
        <div className="dashboard-header__actions">
          <ThemeToggle />
          <IconButton icon={<Bell size={18} />} label="Notifications" variant="ghost" onClick={() => navigate("/provider/notifications")} />
          <Link className="dashboard-header__identity" to="/provider/profile" aria-label="Open your provider profile">
            <Avatar src={profile?.profileImage || undefined} fallback={initials} size="lg" />
            <span className="dashboard-header__identity-copy"><strong>{displayName}</strong><span>Service Provider</span></span>
          </Link>
          <IconButton icon={<LogOut size={18} />} label="Sign out" variant="ghost" onClick={signOut} disabled={signingOut} />
        </div>
      </PageContainer>
    </header>
  );
}
