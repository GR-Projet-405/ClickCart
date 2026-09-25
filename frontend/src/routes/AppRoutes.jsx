import React from "react";
import { Route, Routes } from "react-router-dom";
import UIFoundationShowcase from "../App";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import CustomerExplorePage from "../pages/CustomerExplorePage"; // 🔥 Your new page imported here!
import AdminCategoryDashboard from "../pages/AdminCategoryDashboard";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";
import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

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
        <Route path="categories" element={<AdminCategoryDashboard />} />
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

        {/* 🍏 W route added here! It lives inside the CustomerLayout wrapper */}
        <Route path="explore" element={<CustomerExplorePage />} />

        {customerNavigation.slice(1).map(({ to }) => (
          // Make sure to not double-map "explore" if it is already in your config!
          to.slice(1) !== "explore" && (
            <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
          )
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}