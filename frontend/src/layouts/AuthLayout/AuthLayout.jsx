import React from "react";
import { ChevronDown, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../../components/common/BrandLogo";
import "./AuthLayout.css";

/**
 * DEV-01 layout for the public Login / Register / Password reset pages:
 * a dark utility bar and a split screen with a green brand panel next to the form.
 *
 * @param panel      content of the green brand panel
 * @param panelSide  "left" (login, reset) or "right" (register)
 * @param topBarLinks links shown on the right of the utility bar
 */
export default function AuthLayout({ panel, panelSide = "left", topBarLinks, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-topbar">
        <div className="auth-topbar__inner">
          <div className="auth-topbar__support">
            {/* Phone number removed as per request */}
          </div>
          <nav className="auth-topbar__links" aria-label="Utility navigation">
            {topBarLinks}
          </nav>
        </div>
      </div>

      <div className={`auth-layout__body auth-layout__body--panel-${panelSide}`}>
        <aside className="auth-panel" aria-label="About ClickCart">
          <Link to="/" className="auth-panel__brand" aria-label="ClickCart home">
            <BrandLogo size="shell" showTagline />
          </Link>
          <div className="auth-panel__content">{panel}</div>
        </aside>

        <main className="auth-layout__main">
          <div className="auth-layout__content">
            <Link to="/" className="auth-layout__mobile-brand" aria-label="ClickCart home">
              <BrandLogo size="small" />
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
