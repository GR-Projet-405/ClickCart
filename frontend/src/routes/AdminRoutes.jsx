import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";
import { adminNavigation } from "../config/adminNavigation";

import AdminCategoryDashboard from "../pages/AdminCategoryDashboard";
import VerificationQueue from "../pages/ProviderVerification/VerificationQueue";
import CommissionDashboard from "../pages/commission/CommissionDashboard";
import CommissionTransactionPage from "../pages/commission/CommissionTransactionPage";

export default function AdminRoutes({ isCommission }) {
  if (isCommission) {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<CommissionDashboard />} />
          <Route path="transactions/new" element={<CommissionTransactionPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
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
        <Route path="providers" element={<VerificationQueue />} />

        {/* Dynamic routing for remaining admin navigation */}
        {adminNavigation
          .filter(
            ({ path }) =>
              path !== "/admin/categories" &&
              path !== "/admin/providers" &&
              path !== "/commission_management"
          )
          .map(({ path }) => (
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
    </Routes>
  );
}
import { Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout/AdminLayout";

import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";

import AdminCategoryDashboard from "../pages/AdminCategoryDashboard";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import VerificationQueue from "../pages/ProviderVerification/VerificationQueue";

import CommissionDashboard from "../pages/commission/CommissionDashboard";
import CommissionTransactionPage from "../pages/commission/CommissionTransactionPage";

import { adminNavigation } from "../config/adminNavigation";

const adminWorkspace = (
  <WorkspacePlaceholder
    title="Platform Admin Workspace"
    description="This area is reserved for platform admin feature pages."
  />
);

const implementedAdminPaths = new Set([
  "/admin",
  "/admin/categories",
  "/admin/providers",
  "/commission_management",
]);

export const adminRoutes = (
  <>
    {/* ========================================== */}
    {/* COMMISSION MANAGEMENT ROUTES              */}
    {/* ========================================== */}

    <Route path="/commission_management" element={<AdminLayout />}>
      <Route index element={<CommissionDashboard />} />

      <Route
        path="transactions/new"
        element={<CommissionTransactionPage />}
      />

      <Route path="*" element={<NotFound />} />
    </Route>

    {/* ========================================== */}
    {/* PLATFORM ADMIN ROUTES                     */}
    {/* ========================================== */}

    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboardPage />} />

      {/* Implemented Admin Features */}
      <Route
        path="categories"
        element={<AdminCategoryDashboard />}
      />

      <Route
        path="providers"
        element={<VerificationQueue />}
      />

      {/* Remaining Admin Navigation Routes */}
      {adminNavigation
        .filter(
          ({ path }) =>
            path.startsWith("/admin/") &&
            !implementedAdminPaths.has(path)
        )
        .map(({ path }) => (
          <Route
            key={path}
            path={path.slice("/admin/".length)}
            element={adminWorkspace}
          />
        ))}

      <Route path="*" element={<NotFound />} />
    </Route>
  </>
);
