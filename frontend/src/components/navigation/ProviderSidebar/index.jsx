import React from 'react';
import { Headphones } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../../common/Button";
import SidebarItem from "../SidebarItem";
import { providerNavigation } from "../../../config/providerNavigation";

export default function ProviderSidebar({ onNavigate }) {
  const { pathname } = useLocation();
  return (
    <>
      <nav className="dashboard-sidebar__nav" aria-label="Provider navigation">
        {providerNavigation.map(({ icon: Icon, label, path, demoCount }) => (
          <SidebarItem
            key={path}
            icon={<Icon />}
            label={label}
            to={path}
            active={
              pathname === path ||
              (path.endsWith("dashboard") && pathname === "/provider")
            }
            badge={
              demoCount ? (
                <span
                  className="dashboard-sidebar__badge"
                  aria-label={`${demoCount} demo items`}
                >
                  {demoCount}
                </span>
              ) : undefined
            }
            onClick={onNavigate}
          />
        ))}
      </nav>
      <aside className="dashboard-sidebar__card">
        <span className="dashboard-sidebar__card-icon" aria-hidden="true">
          <Headphones size={20} />
        </span>
        <h2 className="cc-h4">Need Support?</h2>
        <p>Our team is here to help you grow your business.</p>
        <Button variant="outline" size="sm">
          Contact Support
        </Button>
      </aside>
    </>
  );
}
