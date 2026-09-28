import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import UIFoundationShowcase from "../App";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import CustomerRefunds from "../pages/customer/CustomerRefunds";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";
import BookingApprovalPage from "../pages/provider/bookings/BookingApprovalPage";
import ServiceAreasPage from "../pages/provider/serviceAreas/ServiceAreasPage";
import AddServiceAreaPage from "../pages/provider/serviceAreas/AddServiceAreaPage";
import EditServiceAreaPage from "../pages/provider/serviceAreas/EditServiceAreaPage";
import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import ProviderProfileOverview from "../pages/Provider/profile/ProviderProfileOverview";
import ProviderSetup from "../pages/Provider/profile/ProviderSetup";
import EditProviderProfile from "../pages/Provider/profile/EditProviderProfile";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import ProviderServicesPage from "../pages/provider/ProviderServicesPage";
import MarketplaceServicesPage from "../pages/customer/MarketplaceServicesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/provider/dashboard" replace />} />
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServicesPage />} />
        <Route path="bookings" element={<BookingApprovalPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="service-areas/new" element={<AddServiceAreaPage />} />
        <Route path="service-areas/:id/edit" element={<EditServiceAreaPage />} />

        {/* DEV-03 Provider Registration & Profile Routes */}
        <Route path="profile" element={<ProviderProfileOverview />} />
        <Route path="profile/setup" element={<ProviderSetup />} />
        <Route path="profile/edit" element={<EditProviderProfile />} />
        <Route path="profile/public" element={<Navigate to="/providers/12345" replace />} />

        {/* Update: Only one mapping loop for the remaining provider navigation */}
        {providerNavigation
          .filter(({ path }) =>
            path !== "/provider/dashboard" &&
            path !== "/provider/services" &&
            path !== "/provider/bookings" &&
            path !== "/provider/service-areas" &&
            path !== "/provider/profile"
          )
          .map(({ path }) => (
            <Route
              key={path}
              path={path.replace("/provider/", "")}
              element={
                <WorkspacePlaceholder
                  title="Service Provider Workspace"
                  description="This area is reserved for service provider feature pages."
                />
              }
            />
          ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <WorkspacePlaceholder
              title="Platform Admin Workspace"
              description="This area is reserved for platform admin feature pages."
            />
          }
        />
        {adminNavigation.map(({ path }) => (
          <Route
            key={path}
            path={path.replace("/admin/", "")}
            element={
              <WorkspacePlaceholder
                title="Platform Admin Workspace"
                description="This area is reserved for platform admin feature pages."
              />
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerWorkspace />} />
        <Route path="customer/refunds" element={<CustomerRefunds />} />
        <Route path="customer/profile" element={<CustomerProfilePage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="providers/:providerId" element={<PublicProviderProfile />} />
        <Route path="find-services" element={<MarketplaceServicesPage />} />

        {customerNavigation.slice(1).filter(({ to }) => to !== "/find-services").map(({ to }) => (
          <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}