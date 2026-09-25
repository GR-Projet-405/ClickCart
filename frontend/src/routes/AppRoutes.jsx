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

// DEV-33: Notification Center feature pages.
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import NotificationPreferencesPage from "../features/notifications/pages/NotificationPreferencesPage";

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

      {/* DEV-33: Customer Notification Center.
          Pattern per docs/routing-guide.md: the shared layout supplies the
          Outlet; the feature page supplies only the content rendered inside it.
          These sibling routes are added without restructuring the existing
          wildcard routes below. */}
      <Route
        path="/customer/notifications"
        element={
          <CustomerLayout navigation={customerNavigation}>
            <NotificationsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/customer/notifications/preferences"
        element={
          <CustomerLayout navigation={customerNavigation}>
            <NotificationPreferencesPage />
          </CustomerLayout>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <AdminLayout navigation={adminNavigation}>
            <NotificationsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/notifications/preferences"
        element={
          <AdminLayout navigation={adminNavigation}>
            <NotificationPreferencesPage />
          </AdminLayout>
        }
      />

      <Route
        path="/provider/notifications"
        element={
          <ServiceProviderLayout navigation={providerNavigation}>
            <NotificationsPage />
          </ServiceProviderLayout>
        }
      />
      <Route
        path="/provider/notifications/preferences"
        element={
          <ServiceProviderLayout navigation={providerNavigation}>
            <NotificationPreferencesPage />
          </ServiceProviderLayout>
        }
      />

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