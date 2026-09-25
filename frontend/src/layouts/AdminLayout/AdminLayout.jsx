import React from 'react';
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "../../components/navigation/AdminHeader";
import AdminMobileNav from "../../components/navigation/AdminMobileNav";
import AdminSidebar from "../../components/navigation/AdminSidebar";
import AdminTopBar from "../../components/navigation/AdminTopBar";
import "../../styles/dashboard-shell.css";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <div className="dashboard-shell">
      <AdminTopBar />
      <AdminHeader
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <div className="dashboard-shell__body">
        <aside className="dashboard-sidebar">
          <AdminSidebar />
        </aside>
        <main className="dashboard-shell__main">
          <Outlet />
        </main>
      </div>
      <AdminMobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
