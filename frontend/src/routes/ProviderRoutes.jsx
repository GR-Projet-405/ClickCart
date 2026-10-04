import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";
import { providerNavigation } from "../config/providerNavigation";

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

import ProviderProfileOverview from "../pages/Provider/profile/ProviderProfileOverview";
import ProviderSetup from "../pages/Provider/profile/ProviderSetup";
import EditProviderProfile from "../pages/Provider/profile/EditProviderProfile";
import SettlementTrackingPage from "../pages/Provider/SettlementTrackingPage";
import EarningsDashboardPage from "../pages/provider/earnings/EarningsDashboardPage";
import TransactionHistoryPage from "../pages/provider/earnings/TransactionHistoryPage";

import ConversationsPage from "../pages/messaging/ConversationsPage";
import MessagesPage from "../pages/Messages/MessagesPage";
import ProviderReviewsPage from "../pages/reviews/ProviderReviewsPage";

export default function ProviderRoutes() {
  return (
    <Routes>
      <Route element={<ServiceProviderLayout />}>
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
        <Route path="profile/public" element={<Navigate to="/providers/12345" replace />} />

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
    </Routes>
  );
}
