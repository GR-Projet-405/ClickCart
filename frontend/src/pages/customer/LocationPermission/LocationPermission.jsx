import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, ChevronRight, Check } from 'lucide-react';
import './LocationPermission.css';

export default function LocationPermission() {
  const navigate = useNavigate();
  const [isGranted, setIsGranted] = useState(false);

  const handleUseCurrentLocation = () => {
    // In a real app, this would request Geolocation API access
    // and then update the user's location state/preferences (CUS-002).
    console.log("Requesting current location...");
    // Simulate API request and permission granted
    setTimeout(() => {
      setIsGranted(true);
    }, 600);
  };

  const handleSearchLocation = () => {
    navigate('/find-services', { state: { openLocationSearch: true } });
  };

  const handleViewNearbyProviders = () => {
    navigate('/find-services');
  };

  return (
    <div className="location-permission-page">
      {/* Breadcrumb */}
      <div className="location-permission__breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-link" onClick={() => navigate('/find-services')}>Find Services</span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">Location Permission</span>
      </div>

      {/* Main Content with Map Background */}
      <div className="location-permission__content">
        {/* Placeholder pins on the map background to match design */}
        <div style={{ position: 'absolute', top: '38%', left: '15%', zIndex: 1, opacity: 0.6 }}>
          <div style={{ width: 24, height: 24, background: '#9ECFB0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 'bold' }}>K</div>
        </div>
        <div style={{ position: 'absolute', top: '15%', right: '25%', zIndex: 1, opacity: 0.6 }}>
          <div style={{ width: 24, height: 24, background: '#9ECFB0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 'bold' }}>N</div>
        </div>
        <div style={{ position: 'absolute', bottom: '25%', right: '15%', zIndex: 1, opacity: 0.6 }}>
          <div style={{ width: 24, height: 24, background: '#9ECFB0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 'bold' }}>D</div>
        </div>

        <div className={`location-permission__card ${isGranted ? 'location-permission__card--granted' : ''}`}>
          {isGranted ? (
            <>
              <div className="location-permission__granted-icon">
                <Check size={28} />
              </div>
              <h2 className="location-permission__granted-title">Location access granted</h2>
              <p className="location-permission__granted-description">
                Great! We're finding providers near <strong>Negombo, Western Province</strong>.
              </p>
              <button 
                className="location-permission__btn-primary"
                onClick={handleViewNearbyProviders}
              >
                View nearby providers
              </button>
            </>
          ) : (
            <>
              <div className="location-permission__icon-container">
                <MapPin size={24} className="location-permission__icon" strokeWidth={2.5} />
              </div>
              
              <h2 className="location-permission__title">Find services near you</h2>
              <p className="location-permission__description">
                Turn on location to see providers close to you, or search for an area manually.
              </p>

              <button 
                className="location-permission__btn-primary"
                onClick={handleUseCurrentLocation}
              >
                <Navigation size={16} />
                Use my current location
              </button>

              <button 
                className="location-permission__btn-secondary"
                onClick={handleSearchLocation}
              >
                <Search size={15} />
                Search a location instead
              </button>

              <p className="location-permission__footer-text">
                Your location is only used to find nearby providers and is never stored.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
