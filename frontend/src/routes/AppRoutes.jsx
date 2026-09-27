import React from 'react';
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
<<<<<<< Updated upstream
=======
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import ProviderProfileOverview from "../pages/Provider/profile/ProviderProfileOverview";
import ProviderSetup from "../pages/Provider/profile/ProviderSetup";
import EditProviderProfile from "../pages/Provider/profile/EditProviderProfile";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import ProviderServicesPage from "../pages/provider/ProviderServicesPage";
import AiServiceSearchPage from "../pages/customer/AiServiceSearchPage";
>>>>>>> Stashed changes

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />
      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route
          index
          element={
            <WorkspacePlaceholder
              title="Service Provider Workspace"
              description="This area is reserved for service provider feature pages."
            />
          }
        />
        {providerNavigation.map(({ path }) => (
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
<<<<<<< Updated upstream
        {customerNavigation.slice(1).map(({ to }) => (
=======
        <Route path="customer/refunds" element={<CustomerRefunds />} />
        <Route path="customer/profile" element={<CustomerProfilePage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="providers/:providerId" element={<PublicProviderProfile />} />
        <Route path="find-services" element={<AiServiceSearchPage />} />

        {customerNavigation.slice(1).filter(({ to }) => to !== "/find-services").map(({ to }) => (
>>>>>>> Stashed changes
          <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
