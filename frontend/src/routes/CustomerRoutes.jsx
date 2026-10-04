import React from "react";
import { Route, Routes } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import NotFound from "../pages/placeholders/NotFound";
import { customerNavigation } from "../config/customerNavigation";

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

// DEV-26
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentResultPage from "../pages/checkout/PaymentResultPage";
import ReceiptPage from "../pages/checkout/ReceiptPage";
import PaymentHistoryPage from "../pages/customer/PaymentHistoryPage";

// Auth & Public Pages
import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Others
import CustomerReviewsPage from "../pages/reviews/CustomerReviewsPage";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import ConversationsPage from "../pages/messaging/ConversationsPage";
import MessagesPage from "../pages/Messages/MessagesPage";

export default function CustomerRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Customer & Landing Routes */}
      <Route element={<CustomerLayout />}>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* If no exact path is provided to CustomerLayout, maybe CustomerWorkspace */}
        <Route path="workspace" element={<CustomerWorkspace />} />
        
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
