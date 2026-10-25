import ProviderSettings from "../pages/Provider/ProviderSettings";
import ProviderGuard from "../context/ProviderContext";
import { useAuth } from "../context/AuthContext";
import NotificationsPage from "../pages/Provider/NotificationsPage";
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Layout
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";

// Placeholders & Fallbacks
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";

// Config
import { providerNavigation } from "../config/providerNavigation";

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

// DEV-04: Provider Verification Form Component (ආපහු එකතු කළා)
import ProviderVerification from "../components/provider/ProviderVerification";

// Provider Profile & Earnings
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
  const { user } = useAuth();
  return (
    <ProviderGuard><Routes>
      <Route element={<ServiceProviderLayout />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServicesPage />} />


        {/* DEV-04: Provider Verification Route */}
        <Route path="verification" element={<ProviderVerification />} />

        {/* DEV-07: Service Pricing & Packages Route */}
        <Route path="services/:serviceId/pricing" element={<PricingSetupPage />} />
        <Route path="services/:serviceId/media" element={<ServiceMedia />} />

        <Route path="bookings" element={<BookingApprovalPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="service-areas/new" element={<AddServiceAreaPage />} />
        <Route path="service-areas/:id/edit" element={<EditServiceAreaPage />} />
        <Route path="jobs" element={<ProviderJobManagementDashboard />} />
        <Route path="jobs/:jobId" element={<ProviderJobDetailsConsole />} />

        {/* DEV-03: Provider Registration & Profile Routes */}
        <Route path="profile" element={<ProviderProfileOverview />} />
        <Route path="profile/setup" element={<ProviderSetup />} />
        <Route path="profile/edit" element={<EditProviderProfile />} />
        <Route path="profile/public" element={<Navigate to={`/providers/${user?.id}`} replace />} />

        {/* Provider Reviews & Availability */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="calendar" element={<AvailabilityPage key="calendar" initialTab="calendar" />} />
        <Route path="settings" element={<ProviderSettings />} />
        <Route path="availability" element={<AvailabilityPage />} />

        {/* Settlement Tracking & Earnings */}
        <Route path="settlements" element={<SettlementTrackingPage />} />
        <Route path="earnings" element={<EarningsDashboardPage />} />
        <Route path="earnings/transactions" element={<TransactionHistoryPage />} />

        {/* DEV-25: Messages */}
        <Route path="messages" element={<ConversationsPage role="PROVIDER" />} />
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
              path !== "/provider/settlements" &&
              path !== "/provider/calendar" && path !== "/provider/settings" && path !== "/provider/verification" && path !== "/provider/notifications"
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
    </Routes></ProviderGuard>
  );
}
