import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import UIFoundationShowcase from "../App";

// Layouts
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";

// Placeholders & Utility
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";

// Configs
import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

// Admin & Commission Pages
import AdminCategoryDashboard from "../pages/AdminCategoryDashboard";
import VerificationQueue from "../pages/ProviderVerification/VerificationQueue";
import CommissionDashboard from "../pages/commission/CommissionDashboard";
import CommissionTransactionPage from "../pages/commission/CommissionTransactionPage";

// Provider Pages
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderServicesPage from "../pages/provider/ProviderServicesPage";
import PricingSetupPage from "../pages/Provider/PricingSetupPage";
import ServiceMedia from "../pages/provider/ServiceMedia";
import BookingApprovalPage from "../pages/provider/bookings/BookingApprovalPage";
import ServiceAreasPage from "../pages/provider/serviceAreas/ServiceAreasPage";
import AddServiceAreaPage from "../pages/provider/serviceAreas/AddServiceAreaPage";
import EditServiceAreaPage from "../pages/provider/serviceAreas/EditServiceAreaPage";
import ProviderJobManagementDashboard from "../pages/provider/ProviderJobManagementDashboard";
import ProviderJobDetailsConsole from "../pages/provider/ProviderJobDetailsConsole";
import AvailabilityPage from "../pages/provider/AvailabilityPage";

// Provider Profile & Earnings
import ProviderProfileOverview from "../pages/Provider/profile/ProviderProfileOverview";
import ProviderSetup from "../pages/Provider/profile/ProviderSetup";
import EditProviderProfile from "../pages/Provider/profile/EditProviderProfile";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import SettlementTrackingPage from "../pages/Provider/SettlementTrackingPage";
import EarningsDashboardPage from "../pages/provider/earnings/EarningsDashboardPage";
import TransactionHistoryPage from "../pages/provider/earnings/TransactionHistoryPage";

// Shared / Cross-role
import ConversationsPage from "../pages/messaging/ConversationsPage";
import MessagesPage from "../pages/Messages/MessagesPage";

// Customer Pages
import CustomerExplorePage from "../pages/CustomerExplorePage";
import BookingCreation from "../pages/customer/BookingCreation/BookingCreation";
import CustomerRefunds from "../pages/customer/CustomerRefunds";
import LocationPermission from "../pages/customer/LocationPermission/LocationPermission";
import FindServices from "../pages/customer/FindServices/FindServices";
import CustomerProfilePage from "../pages/customer/CustomerProfilePage";
import MarketplaceServicesPage from "../pages/customer/MarketplaceServicesPage";
import AiServiceSearchPage from "../pages/customer/AiServiceSearchPage";
import MyBookingsPage from "../pages/customer/MyBookings";
import MyFavorites from "../pages/MyFavorites";
import RecommendationsPage from "../pages/recommendations/RecommendationsPage";

// Customer Payment & Checkout Feature (DEV-26)
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentResultPage from "../pages/checkout/PaymentResultPage";
import ReceiptPage from "../pages/checkout/ReceiptPage";
import PaymentHistoryPage from "../pages/customer/PaymentHistoryPage";

// Auth & Reviews
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CustomerReviewsPage from "../pages/reviews/CustomerReviewsPage";
import ProviderReviewsPage from "../pages/reviews/ProviderReviewsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dev Showcase Route */}
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />

      {/* Public authentication pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<Navigate to="/provider/dashboard" replace />} />

      {/* ========================================== */}
      {/* COMMISSION MANAGEMENT ROUTES               */}
      {/* ========================================== */}
      <Route path="/commission_management" element={<AdminLayout />}>
        <Route index element={<CommissionDashboard />} />
        <Route path="transactions/new" element={<CommissionTransactionPage />} />
      </Route>

      {/* ========================================== */}
      {/* PROVIDER ROUTES                            */}
      {/* ========================================== */}
      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServicesPage />} />

        {/* DEV-07: Service Pricing & Packages Route */}
        <Route path="services/:serviceId/pricing" element={<PricingSetupPage />} />
        <Route path="services/:serviceId/media" element={<ServiceMedia />} />

        <Route path="bookings" element={<BookingApprovalPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="service-areas/new" element={<AddServiceAreaPage />} />
        <Route path="service-areas/:id/edit" element={<EditServiceAreaPage />} />
        <Route path="jobs" element={<ProviderJobManagementDashboard />} />
        <Route path="jobs/:jobId" element={<ProviderJobDetailsConsole />} />

        {/* DEV-03 Provider Registration & Profile Routes */}
        <Route path="profile" element={<ProviderProfileOverview />} />
        <Route path="profile/setup" element={<ProviderSetup />} />
        <Route path="profile/edit" element={<EditProviderProfile />} />

        {/* Provider Reviews & Availability */}
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="availability" element={<AvailabilityPage />} />

        {/* Settlement Tracking & Earnings */}
        <Route path="settlements" element={<SettlementTrackingPage />} />
        <Route path="earnings" element={<EarningsDashboardPage />} />
        <Route path="earnings/transactions" element={<TransactionHistoryPage />} />

        {/* DEV-25 Messages */}
        <Route path="messages" element={<MessagesPage role="PROVIDER" />} />
        <Route path="messages/conversations" element={<ConversationsPage role="PROVIDER" />} />
        <Route path="messages/:conversationId" element={<ConversationsPage role="PROVIDER" />} />

        {/* Dynamic routing for remaining provider navigation */}
        {providerNavigation
          .filter(
            ({ path }) =>
              path !== "/provider/dashboard" &&
              path !== "/provider/services" &&
              path !== "/provider/bookings" &&
              path !== "/provider/messages" &&
              path !== "/provider/service-areas" &&
              path !== "/provider/availability" &&
              path !== "/provider/reviews" &&
              path !== "/provider/profile" &&
              path !== "/provider/earnings" &&
              path !== "/provider/jobs" &&
              path !== "/provider/settlements"
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

      {/* ========================================== */}
      {/* ADMIN ROUTES                               */}
      {/* ========================================== */}
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

      {/* ========================================== */}
      {/* CUSTOMER ROUTES                            */}
      {/* ========================================== */}
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerWorkspace />} />

        {/* Provider Matching & Recommendations */}
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="explore" element={<CustomerExplorePage />} />

        {/* DEV-25 Messages */}
        <Route path="messages" element={<MessagesPage role="CUSTOMER" />} />
        <Route path="messages/conversations" element={<ConversationsPage role="CUSTOMER" />} />
        <Route path="messages/:conversationId" element={<ConversationsPage role="CUSTOMER" />} />

        {/* DEV-26 Checkout Feature Routes */}
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/result" element={<PaymentResultPage />} />
        <Route path="receipt/:id" element={<ReceiptPage />} />
        <Route path="customer/payments" element={<PaymentHistoryPage />} />

        <Route path="location-permission" element={<LocationPermission />} />
        <Route path="find-services/map" element={<FindServices />} />
        <Route path="booking/create" element={<BookingCreation />} />

        {/* Explicit Routes */}
        <Route path="my-bookings" element={<MyBookingsPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="favorites" element={<MyFavorites />} />
        <Route path="reviews" element={<CustomerReviewsPage />} />
        <Route path="customer/refunds" element={<CustomerRefunds />} />
        <Route path="customer/profile" element={<CustomerProfilePage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="providers/:providerId" element={<PublicProviderProfile />} />

        {/* Search Routes */}
        <Route path="find-services" element={<MarketplaceServicesPage />} />
        <Route path="find-services/ai-search" element={<AiServiceSearchPage />} />
        <Route path="ai-service-search" element={<AiServiceSearchPage />} />

        {/* Dynamic routing for remaining customer navigation */}
        {customerNavigation
          .slice(1)
          .filter(
            ({ to }) =>
              to !== "/find-services" &&
              to !== "/ai-service-search" &&
              to !== "/explore" &&
              to !== "/checkout" &&
              to !== "/customer/payments" &&
              to !== "/messages"
          )
          .map(({ to }) => (
            <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />
          ))}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}