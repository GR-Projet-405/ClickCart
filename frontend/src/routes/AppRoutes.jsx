import React from "react";
import { Routes, Route } from "react-router-dom";
import UIFoundationShowcase from "../App";

import AdminRoutes from "./AdminRoutes";
import ProviderRoutes from "./ProviderRoutes";
import CustomerRoutes from "./CustomerRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dev Showcase Route */}
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      {/* Sub-routers using the wildcard '*' syntax */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/commission_management/*" element={<AdminRoutes isCommission />} />
      <Route path="/provider/*" element={<ProviderRoutes />} />
      
      {/* Customer Routes acts as catch-all / root since it handles /, /login, etc. */}
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}