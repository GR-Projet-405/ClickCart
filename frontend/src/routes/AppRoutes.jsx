import React from 'react';
import { Route, Routes } from "react-router-dom";
import UIFoundationShowcase from "../App";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";

import VerificationQueue from "../pages/ProviderVerification/VerificationQueue";

import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />
      
      {/* Service Provider Routes */}
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

      {/* Admin Routes */}
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
        
        
        <Route path="providers" element={<VerificationQueue />} />

        {adminNavigation.map(({ path }) => {
          const subPath = path.replace("/admin/", "");
          
         
          if (subPath === "providers") return null;

          return (
            <Route
              key={path}
              path={subPath}
              element={
                <WorkspacePlaceholder
                  title="Platform Admin Workspace"
                  description="This area is reserved for platform admin feature pages."
                />
              }
            />
          );
        })}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Customer Routes */}
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