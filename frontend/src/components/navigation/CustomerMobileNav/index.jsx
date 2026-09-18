import NavItem from "../NavItem";
import { customerNavigation } from "../../../config/customerNavigation";
import "./styles.css";

export default function CustomerMobileNav({ open, pathname, onNavigate }) {
  if (!open) return null;
  return (
    <nav
      id="customer-mobile-navigation"
      className="customer-mobile-nav"
      aria-label="Customer mobile navigation"
    >
      {customerNavigation.map((item) => (
        <NavItem
          key={item.label}
          {...item}
          active={pathname === item.to}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}
