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

//importing provider verification steps
import ProviderDashboard from "../pages/provider/Dashboard/ProviderDashboard";
import VerificationStep1 from "../pages/provider/Dashboard/VerificationStep1";
import VerificationStep2 from "../pages/provider/Dashboard/VerificationStep2";
import VerificationSuccess from "../pages/provider/Dashboard/VerificationSuccess";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />
      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="verification/step-1" element={<VerificationStep1 />} />
        <Route path="verification/step-2" element={<VerificationStep2 />} />
        <Route path="verification/success" element={<VerificationSuccess />} />
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
        {customerNavigation.slice(1).map(({ to }) => (
          <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
