import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UIFoundationShowcase from "../App";

// Route Modules (The 3 parts)
import AdminRoutes from "./AdminRoutes";
import ProviderRoutes from "./ProviderRoutes";
import CustomerRoutes from "./CustomerRoutes";

// Public Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dev Showcase Route */}
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      {/* Public authentication pages */}
      <Route path="/login" element={<LoginPage key="public" />} />
      <Route path="/admin/login" element={<LoginPage key="admin" adminPortal />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Sub-routers using the wildcard '*' syntax */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/commission_management/*" element={<AdminRoutes isCommission={true} />} />
      <Route path="/provider/*" element={<ProviderRoutes />} />

      {/* Customer Routes acts as catch-all / root since it handles /, /explore, etc. */}
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}
