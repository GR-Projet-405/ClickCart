import { X } from "lucide-react";
import IconButton from "../../common/IconButton";
import ProviderSidebar from "../ProviderSidebar";

export default function ProviderMobileNav({ open, onClose }) {
  if (!open) return null;
  return (
    <div id="provider-mobile-navigation" className="dashboard-mobile-nav">
      <button
        className="dashboard-mobile-nav__backdrop"
        type="button"
        aria-label="Close provider navigation"
        onClick={onClose}
      />
      <aside className="dashboard-mobile-nav__panel" aria-label="Provider menu">
        <div className="dashboard-mobile-nav__heading">
          <strong>Provider navigation</strong>
          <IconButton
            icon={<X size={18} />}
            label="Close provider navigation"
            variant="ghost"
            onClick={onClose}
          />
        </div>
        <ProviderSidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}
