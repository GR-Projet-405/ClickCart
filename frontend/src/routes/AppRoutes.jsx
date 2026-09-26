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

// 1. Import your new MyFavorites page here
import MyFavorites from '../pages/MyFavorites';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dev Showcase Route */}
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      {/* Provider Routes */}
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

      {/* Customer Routes (This is where your Favorites page lives) */}
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerWorkspace />} />

        {/* 2. Add the explicit route for Favorites BEFORE the map */}
        <Route path="favorites" element={<MyFavorites />} />

        {/* Existing dynamic routes */}
        {customerNavigation.slice(1).map(({ to }) => (
          <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
