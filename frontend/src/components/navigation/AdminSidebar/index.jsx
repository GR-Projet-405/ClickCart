import { BarChart3 } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../../common/Button";
import SidebarItem from "../SidebarItem";
import { adminNavigation } from "../../../config/adminNavigation";

export default function AdminSidebar({ onNavigate }) {
  const { pathname } = useLocation();
  return (
    <>
      <nav className="dashboard-sidebar__nav" aria-label="Admin navigation">
        {adminNavigation.map(({ icon: Icon, label, path }) => (
          <SidebarItem
            key={path}
            icon={<Icon />}
            label={label}
            to={path}
            active={
              pathname === path ||
              (path.endsWith("dashboard") && pathname === "/admin")
            }
            onClick={onNavigate}
          />
        ))}
      </nav>
      <aside className="dashboard-sidebar__card">
        <span className="dashboard-sidebar__card-icon" aria-hidden="true">
          <BarChart3 size={20} />
        </span>
        <h2 className="cc-h4">
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
        <Button variant="outline" size="sm">
          View Reports
        </Button>
      </aside>
    </>
  );
}
