/*
  AdminLayout.jsx
 
  Shell layout wrapping all /admin and /commission_management routes.
 
  Structure
  ──────────
    AdminTopBar       — thin utility bar (phone, marketplace link, locale)
    AdminHeader       — sticky main header (logo, search, identity)
    ┌─ dashboard-shell__body ──────────────────────┐
    │  <aside> AdminSidebar  │  <main> <Outlet />  │
    └──────────────────────────────────────────────┘
    AdminMobileNav    — slide-in drawer for mobile
 
  Features
  ─────────
  • Sidebar collapse/expand (desktop only) via `sidebarCollapsed` state.
  • `data-sidebar-collapsed` attribute on the shell drives CSS width transitions.
  • Mobile nav opens via hamburger in AdminHeader; closes on route change or Escape.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "../../components/navigation/AdminHeader";
import AdminMobileNav from "../../components/navigation/AdminMobileNav";
import AdminSidebar from "../../components/navigation/AdminSidebar";
import AdminTopBar from "../../components/navigation/AdminTopBar";
import "../../styles/dashboard-shell.css";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleMenu = useCallback(
    () => setMenuOpen((open) => !open),
    []
  );

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((c) => !c),
    []
  );

  return (
    <div
      className="dashboard-shell admin-layout"
      data-sidebar-collapsed={sidebarCollapsed || undefined}
    >
      {/* ── Utility top bar ──────────────────────────────────── */}
      <AdminTopBar />

      {/* ── Sticky main header ───────────────────────────────── */}
      <AdminHeader
        menuOpen={menuOpen}
        onMenuToggle={toggleMenu}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={toggleSidebar}
      />

      {/* ── Content area ─────────────────────────────────────── */}
      <div className="dashboard-shell__body">
        {/* Desktop sidebar */}
        <aside
          className="dashboard-sidebar admin-layout__sidebar"
          aria-label="Admin sidebar"
        >
          <AdminSidebar />
        </aside>

        {/* Page content */}
        <main
          id="admin-main-content"
          className="dashboard-shell__main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile slide-in navigation ───────────────────────── */}
      <AdminMobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
