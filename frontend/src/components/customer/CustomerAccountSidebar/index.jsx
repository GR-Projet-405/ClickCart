import React from "react";
import { CheckCircle2, LifeBuoy, ShieldCheck } from "lucide-react";
import Avatar from "../../common/Avatar";
import Badge from "../../common/Badge";
import Button from "../../common/Button";
import { customerAccountNavigation } from "../../../config/customerAccountNavigation";
import "./styles.css";

export default function CustomerAccountSidebar({
  profile,
  activeTab,
  onSelectTab,
  className = "",
}) {
  return (
    <aside className={`customer-account-sidebar ${className}`.trim()}>
      <div className="customer-account-sidebar__user-summary">
        <div className="customer-account-sidebar__avatar-wrap">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.fullName.slice(0, 2).toUpperCase()}
            size="lg"
            online
          />
        </div>
        <div className="customer-account-sidebar__identity">
          <h2 className="cc-h4 customer-account-sidebar__name">
            {profile.fullName}
          </h2>
          <span className="customer-account-sidebar__email">
            {profile.email}
          </span>
          <div className="customer-account-sidebar__badge-row">
            <Badge variant="success">
              <ShieldCheck size={13} style={{ marginRight: 4 }} />
              {profile.verification.badgeLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="customer-account-sidebar__completion">
        <div className="customer-account-sidebar__completion-header">
          <span>Profile Strength</span>
          <strong className="customer-account-sidebar__completion-pct">
            100%
          </strong>
        </div>
        <div className="customer-account-sidebar__progress-bar">
          <div
            className="customer-account-sidebar__progress-fill"
            style={{ width: "100%" }}
          />
        </div>
        <span className="customer-account-sidebar__completion-caption">
          <CheckCircle2 size={12} color="var(--cc-success)" />
          All verifications & details complete
        </span>
      </div>

      <nav
        className="customer-account-sidebar__nav"
        aria-label="Customer account navigation"
      >
        {customerAccountNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`customer-account-sidebar__item ${
                isActive ? "customer-account-sidebar__item--active" : ""
              }`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="customer-account-sidebar__item-icon">
                <Icon size={18} />
              </span>
              <div className="customer-account-sidebar__item-text">
                <span className="customer-account-sidebar__item-label">
                  {item.label}
                </span>
                <span className="customer-account-sidebar__item-desc">
                  {item.description}
                </span>
              </div>
              {item.id === "addresses" && profile.savedAddresses?.length > 0 && (
                <span className="customer-account-sidebar__badge">
                  {profile.savedAddresses.length}
                </span>
              )}
              {item.badge && item.id !== "addresses" && (
                <span className="customer-account-sidebar__badge">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="customer-account-sidebar__support-card">
        <div className="customer-account-sidebar__support-icon">
          <LifeBuoy size={20} />
        </div>
        <div>
          <h3 className="cc-h4">Need Assistance?</h3>
          <p className="cc-caption cc-text-secondary">
            Our 24/7 customer support team is always ready to help you.
          </p>
        </div>
        <Button variant="outline" size="sm" className="customer-account-sidebar__support-btn">
          Contact Support
        </Button>
      </div>
    </aside>
  );
}
