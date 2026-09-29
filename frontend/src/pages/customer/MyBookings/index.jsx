import React, { useEffect, useState } from "react";
import PageContainer from "../../../components/common/PageContainer";
import Spinner from "../../../components/common/Spinner";
import EmptyState from "../../../components/common/EmptyState";
import {
  fetchCustomerBookings,
  fetchCustomerBookingSummary,
  cancelBooking,
} from "../../../services/bookingService";
import BookingTabs from "./BookingTabs";
import BookingCard from "./BookingCard";
import BookingDetailsModal from "./BookingDetailsModal";
import "./styles.css";

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const customerId = "cust_101";

  const loadData = async (tab) => {
    setLoading(true);
    try {
      const [bookingsData, summaryData] = await Promise.all([
        fetchCustomerBookings(customerId, tab),
        fetchCustomerBookingSummary(customerId),
      ]);
      setBookings(bookingsData || []);
      setSummary(summaryData || null);
    } catch (error) {
      console.error("Failed to load customer bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await cancelBooking(bookingId, reason);
      await loadData(activeTab);
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case "upcoming":
        return "UPCOMING BOOKINGS";
      case "active":
        return "ACTIVE BOOKINGS";
      case "history":
        return "BOOKING HISTORY";
      default:
        return "BOOKINGS";
    }
  };

  return (
    <div className="my-bookings">
      <PageContainer>
        {/* Header */}
        <header className="my-bookings__header">
          <h1 className="my-bookings__title">My Bookings</h1>
          <p className="my-bookings__subtitle">
            Manage your upcoming, active and previous services.
          </p>
        </header>

        {/* Tab Filters */}
        <BookingTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          summary={summary}
        />

        {/* Section Heading */}
        <h2 className="my-bookings__section-heading">{getSectionTitle()}</h2>

        {/* Content Area */}
        {loading ? (
          <div className="my-bookings__loading" style={{ display: "grid", placeItems: "center", minHeight: "200px" }}>
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} bookings`}
            description={`You currently do not have any ${activeTab} service bookings.`}
          />
        ) : (
          <div className="my-bookings__list">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={(b) => setSelectedBooking(b)}
              />
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancelBooking={handleCancelBooking}
          />
        )}
      </PageContainer>
    </div>
  );
}
