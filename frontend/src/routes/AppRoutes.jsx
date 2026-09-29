import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import UIFoundationShowcase from "../App";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import CustomerRefunds from "../pages/customer/CustomerRefunds";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import AiServiceSearchPage from "../pages/customer/AiServiceSearchPage";
import MarketplaceServicesPage from "../pages/customer/MarketplaceServicesPage";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import CommissionDashboard from "../pages/commission/CommissionDashboard";
import CommissionTransactionPage from "../pages/commission/CommissionTransactionPage";
import NotFound from "../pages/placeholders/NotFound";
import ServiceMedia from "../pages/provider/ServiceMedia";
import BookingApprovalPage from "../pages/provider/bookings/BookingApprovalPage";
import ServiceAreasPage from "../pages/provider/serviceAreas/ServiceAreasPage";
import AddServiceAreaPage from "../pages/provider/serviceAreas/AddServiceAreaPage";
import EditServiceAreaPage from "../pages/provider/serviceAreas/EditServiceAreaPage";
import ProviderServicesPage from "../pages/provider/ProviderServicesPage";
import ProviderProfileOverview from "../pages/Provider/profile/ProviderProfileOverview";
import ProviderSetup from "../pages/Provider/profile/ProviderSetup";
import EditProviderProfile from "../pages/Provider/profile/EditProviderProfile";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import CustomerReviewsPage from "../pages/reviews/CustomerReviewsPage";
import ProviderReviewsPage from "../pages/reviews/ProviderReviewsPage";
import EarningsDashboardPage from "../pages/provider/earnings/EarningsDashboardPage";
import TransactionHistoryPage from "../pages/provider/earnings/TransactionHistoryPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import MyFavorites from "../pages/MyFavorites";
import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      {/* Public authentication pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Navigate to="/provider/dashboard" replace />} />

      {/* Commission Management */}
      <Route path="/commission_management" element={<AdminLayout />}>
        <Route index element={<CommissionDashboard />} />
        <Route path="transactions/new" element={<CommissionTransactionPage />} />
      </Route>

      {/* Provider routes */}
      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServicesPage />} />
        <Route path="services/:serviceId/media" element={<ServiceMedia />} />
        <Route path="bookings" element={<BookingApprovalPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="service-areas/new" element={<AddServiceAreaPage />} />
        <Route path="service-areas/:id/edit" element={<EditServiceAreaPage />} />
        <Route path="profile" element={<ProviderProfileOverview />} />
        <Route path="profile/setup" element={<ProviderSetup />} />
        <Route path="profile/edit" element={<EditProviderProfile />} />
        <Route path="profile/public" element={<Navigate to="/providers/12345" replace />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="earnings" element={<EarningsDashboardPage />} />
        <Route path="earnings/transactions" element={<TransactionHistoryPage />} />
        {providerNavigation
          .filter(({ path }) => ![
            "/provider/dashboard",
            "/provider/services",
            "/provider/bookings",
            "/provider/service-areas",
            "/provider/reviews",
            "/provider/profile",
            "/provider/earnings",
          ].includes(path))
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

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/commission_management" replace />} />
        {adminNavigation.filter(({ path }) => path !== "/commission_management").map(({ path }) => (
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

      {/* Customer routes */}
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerWorkspace />} />
        <Route path="favorites" element={<MyFavorites />} />
        <Route path="reviews" element={<CustomerReviewsPage />} />
        <Route path="customer/refunds" element={<CustomerRefunds />} />
        <Route path="customer/profile" element={<CustomerProfilePage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="providers/:providerId" element={<PublicProviderProfile />} />
        <Route path="find-services" element={<AiServiceSearchPage />} />
        {customerNavigation.slice(1)
          .filter(({ to }) => to !== "/find-services")
          .map(({ to }) => <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />)}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
