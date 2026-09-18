import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ProviderHeader from "../../components/navigation/ProviderHeader";
import ProviderMobileNav from "../../components/navigation/ProviderMobileNav";
import ProviderSidebar from "../../components/navigation/ProviderSidebar";
import ProviderTopBar from "../../components/navigation/ProviderTopBar";
import "../../styles/dashboard-shell.css";
import "./ServiceProviderLayout.css";

export default function ServiceProviderLayout() {
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
      <ProviderTopBar />
      <ProviderHeader
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <div className="dashboard-shell__body">
        <aside className="dashboard-sidebar">
          <ProviderSidebar />
        </aside>
        <main className="dashboard-shell__main">
          <Outlet />
        </main>
      </div>
      <ProviderMobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
