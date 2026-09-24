import React from "react";
import { Route, Routes } from "react-router-dom";

import UIFoundationShowcase from "../App";

import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";

import AdminLayout from "../layouts/AdminLayout/AdminLayout";

import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";

import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";

import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

import Home from "../pages/Home";
import ProviderDetails from "../pages/ProviderDetails";
import ServiceDetails from "../pages/ServiceDetails";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Main pages */}
      <Route path="/" element={<Home />} />

      {/* Service & Provider Details */}
      <Route path="/provider/:id" element={<ProviderDetails />} />
      <Route path="/service/:id" element={<ServiceDetails />} />

      {/* Existing DEV routes */}
      <Route path="/showcase" element={<UIFoundationShowcase />} />

      <Route
        path="/customer/*"
        element={
          <CustomerLayout navigation={customerNavigation}>
            <CustomerWorkspace />
          </CustomerLayout>
        }
      />

      <Route
        path="/admin/*"
        element={
          <AdminLayout navigation={adminNavigation}>
            <WorkspacePlaceholder />
          </AdminLayout>
        }
      />

      <Route
        path="/provider/*"
        element={
          <ServiceProviderLayout navigation={providerNavigation}>
            <WorkspacePlaceholder />
          </ServiceProviderLayout>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}