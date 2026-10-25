import { useAuth, homePathForRole } from "../context/AuthContext";
import React from "react";
import { Navigate, useLocation, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminRecordsPage from "../pages/admin/AdminRecordsPage";
import NotFound from "../pages/placeholders/NotFound";


import AdminCategoryDashboard from "../pages/AdminCategoryDashboard";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import VerificationQueue from "../pages/ProviderVerification/VerificationQueue";
import CommissionDashboard from "../pages/commission/CommissionDashboard";
import CommissionTransactionPage from "../pages/commission/CommissionTransactionPage";

export default function AdminRoutes({ isCommission }) {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <p role="status">Restoring your account…</p>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (user.role !== "PLATFORM_ADMIN") return <Navigate to={homePathForRole(user.role)} replace />;
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
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoryDashboard />} />
        <Route path="providers" element={<VerificationQueue />} />

        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="users" element={<AdminRecordsPage key="users" type="users" />} />
        <Route path="bookings" element={<AdminRecordsPage key="bookings" type="bookings" />} />
        <Route path="transactions" element={<AdminRecordsPage key="payments" type="payments" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}