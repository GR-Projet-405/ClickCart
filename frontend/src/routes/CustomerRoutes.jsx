import CustomerGuard from "../context/CustomerGuard";
import React from "react";
import { Route, Routes } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import NotFound from "../pages/placeholders/NotFound";

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

// Public Pages
import LandingPage from "../pages/customer/LandingPage";
import CustomerReviewsPage from "../pages/reviews/CustomerReviewsPage";
import PublicProviderProfile from "../pages/Provider/profile/PublicProviderProfile";
import ConversationsPage from "../pages/messaging/ConversationsPage";
import NotificationsPage from "../pages/provider/NotificationsPage";

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="workspace" element={<CustomerGuard><CustomerWorkspace /></CustomerGuard>} />

        <Route path="notifications" element={<CustomerGuard><NotificationsPage /></CustomerGuard>} />
        <Route path="recommendations" element={<CustomerGuard><RecommendationsPage /></CustomerGuard>} />
        <Route path="explore" element={<CustomerExplorePage />} />

        <Route path="messages" element={<CustomerGuard><ConversationsPage role="CUSTOMER" /></CustomerGuard>} />
        <Route path="messages/conversations" element={<CustomerGuard><ConversationsPage role="CUSTOMER" /></CustomerGuard>} />
        <Route path="messages/:conversationId" element={<CustomerGuard><ConversationsPage role="CUSTOMER" /></CustomerGuard>} />

        <Route path="checkout" element={<CustomerGuard><CheckoutPage /></CustomerGuard>} />
        <Route path="checkout/result" element={<CustomerGuard><PaymentResultPage /></CustomerGuard>} />
        <Route path="receipt/:id" element={<CustomerGuard><ReceiptPage /></CustomerGuard>} />
        <Route path="customer/payments" element={<CustomerGuard><PaymentHistoryPage /></CustomerGuard>} />

        <Route path="location-permission" element={<LocationPermission />} />
        <Route path="find-services/map" element={<FindServices />} />
        <Route path="booking/create" element={<CustomerGuard><BookingCreation /></CustomerGuard>} />

        <Route path="my-bookings" element={<CustomerGuard><MyBookingsPage /></CustomerGuard>} />
        <Route path="bookings" element={<CustomerGuard><MyBookingsPage /></CustomerGuard>} />
        <Route path="favorites" element={<CustomerGuard><MyFavorites /></CustomerGuard>} />
        <Route path="reviews" element={<CustomerGuard><CustomerReviewsPage /></CustomerGuard>} />
        <Route path="customer/refunds" element={<CustomerGuard><CustomerRefunds /></CustomerGuard>} />
        <Route path="customer/profile" element={<CustomerGuard><CustomerProfilePage /></CustomerGuard>} />
        <Route path="profile" element={<CustomerGuard><CustomerProfilePage /></CustomerGuard>} />
        <Route path="providers/:providerId" element={<PublicProviderProfile />} />

        <Route path="find-services" element={<MarketplaceServicesPage />} />
        <Route path="find-services/ai-search" element={<AiServiceSearchPage />} />
        <Route path="ai-service-search" element={<AiServiceSearchPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
