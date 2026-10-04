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
