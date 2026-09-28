import React from 'react';
import { X } from "lucide-react";
import IconButton from "../../common/IconButton";
import AdminSidebar from "../AdminSidebar";

export default function AdminMobileNav({ open, onClose }) {
  if (!open) return null;
  return (
    <div id="admin-mobile-navigation" className="dashboard-mobile-nav">
      <button
        className="dashboard-mobile-nav__backdrop"
        type="button"
        aria-label="Close admin navigation"
        onClick={onClose}
      />
      <aside className="dashboard-mobile-nav__panel" aria-label="Admin menu">
        <div className="dashboard-mobile-nav__heading">
          <strong>Admin navigation</strong>
          <IconButton
            icon={<X size={18} />}
            label="Close admin navigation"
            variant="ghost"
            onClick={onClose}
          />
        </div>
        <AdminSidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}
