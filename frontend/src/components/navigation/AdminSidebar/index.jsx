import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import Button from "../../common/Button";
import SidebarItem from "../SidebarItem";
import { adminNavigation } from "../../../config/adminNavigation";
import "./AdminSidebar.css";

function isActive(pathname, path) {
  if (path === "/admin") return pathname === "/admin";
  if (path === "/commission_management")
    return pathname === path || pathname.startsWith("/commission_management/");
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function AdminSidebar({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <div className="admin-sidebar">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="admin-sidebar__scroll">
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {adminNavigation.map(({ icon: Icon, label, path }) => (
            <SidebarItem
              key={path}
              icon={<Icon size={18} />}
              label={label}
              to={path}
              active={isActive(pathname, path)}
              onClick={onNavigate}
            />
          ))}
        </nav>
      </div>

      {/* ── Promotional card ───────────────────────────────────── */}
      <aside className="admin-sidebar__promo" aria-label="Admin quick action">
        <span className="admin-sidebar__promo-icon" aria-hidden="true">
          <BarChart3 size={20} />
        </span>
        <h2>
          Grow a Safer
          <br />
          Local Services
          <br />
          Marketplace
        </h2>
        <p>
          Manage. Moderate. Scale.
          <br />
          All in one place.
        </p>
        <Link className="cc-button cc-button--outline cc-button--sm" style={{textDecoration:"none"}} to="/admin/bookings">View bookings →</Link>
      </aside>
    </div>
  );
}
