import React, { useState } from 'react';
import ProviderProfileView from './ProviderProfileView';
import BookingModal from './BookingModal';
import { fetchProviderDetails } from './api/providerService'; // Your API helper

export default function ProviderPageContainer({ initialProviderId, onBackToList }) {
  const [currentProviderId, setCurrentProviderId] = useState(initialProviderId);
  const [providerData, setProviderData] = useState(null); // Loaded provider object
  const [loading, setLoading] = useState(false);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Function to switch active profile when clicking "Profile" on a recommendation card
  const handleSelectProvider = async (newProviderId) => {
    setLoading(true);
    setCurrentProviderId(newProviderId);
    try {
      // Fetch new provider details from your Spring Boot backend
      const data = await fetchProviderDetails(newProviderId);
      setProviderData(data);
    } catch (error) {
      console.error("Failed to load alternative provider profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (serviceDetails = null) => {
    setSelectedService(serviceDetails);
    setIsBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return <div className="loading-skeleton">Loading provider profile...</div>;
  }

  return (
    <>
      <ProviderProfileView 
        provider={providerData} 
        onBack={onBackToList}
        onBookService={handleOpenBooking}
        onSelectAlternativeProvider={handleSelectProvider} 
      />

      {isBookingModalOpen && (
        <BookingModal 
          provider={providerData}
          service={selectedService}
          onClose={handleCloseBooking}
        />
      )}
    </>
  );
}