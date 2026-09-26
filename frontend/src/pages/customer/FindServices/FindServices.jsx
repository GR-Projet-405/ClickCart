import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, MapPin, Star, Crosshair, X, Filter, Target, Home, Wrench, Zap, Snowflake, Scissors, BookOpen, Check } from 'lucide-react';
import './FindServices.css';
import './FilterSidebar.css';

import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api';
import FilterSidebar from './FilterSidebar';

const FILTERS = ['All', 'Cleaning', 'Plumbing', 'AC Repair', 'Electrical', 'Beauty & Salon'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 7.8731, 
  lng: 80.7718
};

const libraries = ['places'];

export default function FindServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const [providers, setProviders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeProviderId, setActiveProviderId] = useState(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(location.state?.openLocationSearch || false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [searchRadius, setSearchRadius] = useState(2);
  const [hasLocationFilter, setHasLocationFilter] = useState(false);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Map state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(8);
  
  const [isSearchingProviders, setIsSearchingProviders] = useState(false);

  const handleLocationSelect = (loc) => {
    setSearchQuery(loc.name);
    setLocationResults([]);
    setIsSearchingLocation(false);
    setIsSearchingProviders(true);
    
    if (loc.place_id && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: loc.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          
          setTimeout(() => {
            setMapCenter({ lat, lng });
            setMapZoom(13);
            setHasLocationFilter(true);
            setSearchRadius(2);
            setIsSearchingProviders(false);
          }, 1500); // Simulate finding providers
        } else {
          setIsSearchingProviders(false);
        }
      });
    } else if (loc.lat && loc.lng) {
      // Fallback
      setTimeout(() => {
        setMapCenter({ lat: loc.lat, lng: loc.lng });
        setMapZoom(13);
        setHasLocationFilter(true);
        setSearchRadius(2);
        setIsSearchingProviders(false);
      }, 1500);
    } else {
      setIsSearchingProviders(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearchingProviders(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(13);
          setSearchQuery('Current Location');
          setLocationResults([]);
          setIsSearchingLocation(false);
          
          setTimeout(() => {
            setHasLocationFilter(true);
            setSearchRadius(2);
            setIsSearchingProviders(false);
          }, 1500);
        },
        () => {
          console.error("Geolocation failed");
          setIsSearchingLocation(false);
        }
      );
    } else {
      setIsSearchingLocation(false);
    }
  };

  const performRawSearch = () => {
    if (!searchQuery) return;
    setLocationResults([]);
    setIsSearchingLocation(false);
    setIsSearchingProviders(true);

    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery, componentRestrictions: { country: 'LK' } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          setTimeout(() => {
            setMapCenter({ lat, lng });
            setMapZoom(13);
            setHasLocationFilter(true);
            setSearchRadius(2);
            setIsSearchingProviders(false);
          }, 1000);
        } else {
          fallbackRawSearch();
        }
      });
    } else {
      fallbackRawSearch();
    }

    async function fallbackRawSearch() {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setTimeout(() => {
            setMapCenter({ lat, lng });
            setMapZoom(13);
            setHasLocationFilter(true);
            setSearchRadius(2);
            setIsSearchingProviders(false);
          }, 1000);
        } else {
          // If all geocoding fails, fallback to hardcoded mock locations
          const mockLocations = [
            { id: '1', name: 'Kurunegala', description: 'North Western Province, Sri Lanka', lat: 7.4818, lng: 80.3609 },
            { id: '2', name: 'Ampara', description: 'Eastern Province, Sri Lanka', lat: 7.2945, lng: 81.6744 },
            { id: '3', name: 'Hatton', description: 'Central Province, Sri Lanka', lat: 6.8898, lng: 80.5960 },
            { id: '4', name: 'Negombo', description: 'Western Province, Sri Lanka', lat: 7.2008, lng: 79.8737 },
            { id: '5', name: 'Colombo', description: 'Western Province, Sri Lanka', lat: 6.9271, lng: 79.8612 },
            { id: '6', name: 'Kandy', description: 'Central Province, Sri Lanka', lat: 7.2906, lng: 80.6337 },
            { id: '7', name: 'Galle', description: 'Southern Province, Sri Lanka', lat: 6.0535, lng: 80.2210 }
          ];
          const query = searchQuery.toLowerCase();
          const match = mockLocations.find(loc => loc.name.toLowerCase().includes(query) || loc.description.toLowerCase().includes(query));
          
          if (match) {
            setTimeout(() => {
              setMapCenter({ lat: match.lat, lng: match.lng });
              setMapZoom(13);
              setHasLocationFilter(true);
              setSearchRadius(2);
              setIsSearchingProviders(false);
            }, 1000);
          } else {
            // Absolute final fallback: just trigger empty state where the map is currently centered
            setTimeout(() => {
              setHasLocationFilter(true);
              setSearchRadius(2);
              setIsSearchingProviders(false);
            }, 1000);
          }
        }
      } catch (e) {
        // Absolute final fallback: just trigger empty state where the map is currently centered
        setTimeout(() => {
          setHasLocationFilter(true);
          setSearchRadius(2);
          setIsSearchingProviders(false);
        }, 1000);
      }
    }
  };

  const handleProviderSelect = (provider) => {
    setActiveProviderId(provider.id);
    if (provider.lat && provider.lng) {
      setMapCenter({ lat: provider.lat, lng: provider.lng });
      setMapZoom(15);
    }
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data);
          if (data.length > 0) {
            setActiveProviderId(data[0].id); // Select first by default
          }
        }
      } catch (error) {
        console.error("Failed to fetch providers", error);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (searchQuery.trim().length === 0) {
        setLocationResults([]);
        return;
      }
      setIsLoadingLocation(true);
      try {
        if (window.google && window.google.maps && window.google.maps.places) {
          const autocompleteService = new window.google.maps.places.AutocompleteService();
          autocompleteService.getPlacePredictions(
            { 
              input: searchQuery,
              componentRestrictions: { country: "lk" }
            },
            async (predictions, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                const results = predictions.map(p => ({
                  id: p.place_id,
                  name: p.structured_formatting?.main_text || p.description,
                  description: p.structured_formatting?.secondary_text || "",
                  place_id: p.place_id
                }));
                setLocationResults(results);
                setIsLoadingLocation(false);
              } else {
                console.warn("Google Places API failed:", status, "- Falling back to local data");
                fallbackToLocalData();
              }
            }
          );
        } else {
          fallbackToLocalData();
        }

        function fallbackToLocalData() {
          const mockLocations = [
            { id: '1', name: 'Kurunegala', description: 'North Western Province, Sri Lanka', lat: 7.4818, lng: 80.3609 },
            { id: '2', name: 'Ampara', description: 'Eastern Province, Sri Lanka', lat: 7.2945, lng: 81.6744 },
            { id: '3', name: 'Hatton', description: 'Central Province, Sri Lanka', lat: 6.8898, lng: 80.5960 },
            { id: '4', name: 'Negombo', description: 'Western Province, Sri Lanka', lat: 7.2008, lng: 79.8737 },
            { id: '5', name: 'Colombo', description: 'Western Province, Sri Lanka', lat: 6.9271, lng: 79.8612 },
            { id: '6', name: 'Kandy', description: 'Central Province, Sri Lanka', lat: 7.2906, lng: 80.6337 },
            { id: '7', name: 'Galle', description: 'Southern Province, Sri Lanka', lat: 6.0535, lng: 80.2210 }
          ];
          
          const query = searchQuery.toLowerCase();
          const results = mockLocations.filter(loc => loc.name.toLowerCase().includes(query) || loc.description.toLowerCase().includes(query));
          setLocationResults(results);
          setIsLoadingLocation(false);
        }
      } catch (error) {
        console.error("Failed to fetch autocomplete results", error);
        setIsLoadingLocation(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchLocations();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, isLoaded]);

  const highlightMatch = (text, match) => {
    if (!text) return "";
    if (!match) return text;
    const regex = new RegExp(`(${match})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  };

  const filteredProviders = providers.filter(p => {
    const categoryMatch = activeFilter === 'All' || p.category.includes(activeFilter);
    if (!categoryMatch) return false;

    if (minRating > 0 && (p.rating || 0) < minRating) return false;

    if (hasLocationFilter && p.lat && p.lng) {
      const distance = calculateDistance(mapCenter.lat, mapCenter.lng, p.lat, p.lng);
      return distance <= searchRadius;
    }
    return true;
  });
  
  const activeProvider = providers.find(p => p.id === activeProviderId);

  return (
    <div className="find-services-page">
      {/* Breadcrumb */}
      <div className="find-services__breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-link" onClick={() => navigate('/find-services')}>Find Services</span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">Map View</span>
      </div>

      {/* Location Search and Filter Row */}
      <div className="find-services__search-row">
        <div className="find-services__search-container">
          <div className={`find-services__search-bar ${searchQuery && locationResults.length > 0 ? 'find-services__search-bar--active' : ''}`}>
            <MapPin size={16} color="#1ABA1A" fill="none" strokeWidth={2.5} />
            <input
              type="text"
              className="find-services__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (locationResults.length > 0) {
                    handleLocationSelect(locationResults[0]);
                  } else {
                    performRawSearch();
                  }
                }
              }}
              placeholder="Search any location..."
            />
            {searchQuery && (
              <div className="find-services__clear-btn" onClick={() => setSearchQuery('')} style={{ marginRight: '8px' }}>
                <X size={12} color="#9CA3AF" strokeWidth={3} />
              </div>
            )}
            <button 
              style={{
                background: '#1ABA1A', color: 'white', border: 'none', borderRadius: '6px', 
                padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
              }}
              onClick={() => {
                if (locationResults.length > 0) {
                  handleLocationSelect(locationResults[0]);
                } else {
                  performRawSearch();
                }
              }}
            >
              Search
            </button>
          </div>

          {searchQuery && locationResults.length > 0 && (
            <div className="find-services__dropdown">
              {locationResults.map((loc, idx) => {
                const isFirst = idx === 0;
                return (
                  <div 
                    key={loc.id || idx} 
                    className={`find-services__dropdown-item ${isFirst ? 'find-services__dropdown-item--highlight' : ''}`}
                    onClick={() => handleLocationSelect(loc)}
                  >
                    <div className={`find-services__icon-container ${isFirst ? 'find-services__icon-container--highlight' : ''}`}>
                      <MapPin size={14} fill={isFirst ? "#1ABA1A" : "#9CA3AF"} color={isFirst ? "#1ABA1A" : "#9CA3AF"} />
                    </div>
                    <div className="find-services__item-text">
                      <p className="find-services__item-title">
                        {highlightMatch(loc.name, searchQuery)}
                      </p>
                      <p className="find-services__item-subtitle">{loc.description}</p>
                    </div>
                    {isFirst && <span style={{ color: '#1ABA1A', marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold' }}>↗</span>}
                  </div>
                );
              })}

              {locationResults.length > 0 && <div className="find-services__divider" />}

              <div className="find-services__current-location" onClick={handleCurrentLocation}>
                <div className="find-services__current-icon">
                  <Target size={16} />
                </div>
                <span className="find-services__current-text">Use my current location instead</span>
              </div>
            </div>
          )}
        </div>
        
        <button className="find-services__filters-btn" onClick={() => setIsFilterOpen(true)}>
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Filters Bar */}
      <div className="find-services__filters-bar">
        {FILTERS.map(filter => (
          <button 
            key={filter}
            className={`find-services__filter-btn ${activeFilter === filter ? 'find-services__filter-btn--active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
        <div style={{ flexGrow: 1 }} />
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#364153' }}>
          <strong>{filteredProviders.length}</strong> providers found
        </span>
      </div>

      {/* Main Content Area */}
      <div className="find-services__content">
        {/* Sidebar */}
        <div className="find-services__sidebar">
          {isSearchingProviders ? (
            <>
              <div className="skeleton-bone" style={{ width: '142px', height: '12px', marginBottom: '12px', marginLeft: '12px' }} />
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="skeleton-provider-card">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-info">
                    <div className="skeleton-bone" style={{ width: '100px', height: '13px', marginBottom: '8px' }} />
                    <div className="skeleton-bone" style={{ width: '80px', height: '11px', marginBottom: '8px' }} />
                    <div className="skeleton-bone" style={{ width: '60px', height: '10px' }} />
                  </div>
                  <div className="skeleton-pill" />
                </div>
              ))}
            </>
          ) : filteredProviders.length === 0 ? (
            <div className="find-services__empty-sidebar">
              <div className="find-services__empty-icon">
                <MapPin size={32} color="#9CA3AF" />
              </div>
              <h3 className="find-services__empty-title">No providers found here</h3>
              <p className="find-services__empty-subtitle">Try widening your search radius or choosing a different area.</p>
              <button className="find-services__empty-btn" onClick={() => setSearchRadius(10)}>
                <span style={{ fontSize: '18px', marginRight: '4px', fontWeight: '400' }}>+</span>
                Expand search to 10 km
              </button>
              <button className="find-services__empty-btn-secondary" onClick={() => { setActiveFilter('All'); setHasLocationFilter(false); }}>
                Browse all categories instead
              </button>
            </div>
          ) : (
            filteredProviders.map(provider => (
              <div 
                key={provider.id}
                className={`find-services__provider-card ${activeProviderId === provider.id ? 'find-services__provider-card--active' : ''}`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="provider-card__avatar" style={{ backgroundColor: provider.color }}>
                  {provider.initials}
                </div>
                <div className="provider-card__info">
                  <h3 className="provider-card__name">{provider.name}</h3>
                  <p className="provider-card__category">{provider.category}</p>
                  <div className="provider-card__rating">
                    <Star fill="#F59E0B" color="#F59E0B" size={12} />
                    <span className="provider-card__rating-value">{provider.rating}</span>
                    <span className="provider-card__rating-count">({provider.reviewsCount})</span>
                  </div>
                </div>
                <div className="provider-card__distance">
                  <MapPin size={10} color="#149114" />
                  {provider.distance || '2.4 km'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Area */}
        <div className="find-services__map-area">
          {/* Location Tag Removed (Now in Top Bar) */}

          {/* Filter Sidebar Overlay */}
          {isFilterOpen && (
            <>
              <div className="find-services__filter-overlay-bg" onClick={() => setIsFilterOpen(false)} />
              <div className="find-services__filter-sidebar">
                <div className="filter-sidebar__header">
                  <h2>Filters</h2>
                  <div className="filter-sidebar__close" onClick={() => setIsFilterOpen(false)}>
                    <X size={14} color="#6B7280" strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="filter-sidebar__content">
                  {/* Category */}
                  <div className="filter-section">
                    <h3 className="filter-section__title">Category</h3>
                    <div className="filter-category__grid">
                      <button className="filter-category__btn filter-category__btn--active">
                        <Home size={16} color="#008236" />
                        <span className="filter-category__text" style={{ color: '#149114' }}>Home Cleaning</span>
                        <div className="filter-category__check">
                          <Check size={8} color="#FFFFFF" strokeWidth={4} />
                        </div>
                      </button>
                      <button className="filter-category__btn">
                        <Wrench size={16} color="#6A7282" />
                        <span className="filter-category__text">Plumbing</span>
                      </button>
                      <button className="filter-category__btn">
                        <Zap size={16} color="#6A7282" />
                        <span className="filter-category__text">Electrical</span>
                      </button>
                      <button className="filter-category__btn filter-category__btn--active">
                        <Snowflake size={16} color="#008236" />
                        <span className="filter-category__text" style={{ color: '#149114' }}>AC Repair</span>
                        <div className="filter-category__check">
                          <Check size={8} color="#FFFFFF" strokeWidth={4} />
                        </div>
                      </button>
                      <button className="filter-category__btn">
                        <Scissors size={16} color="#6A7282" />
                        <span className="filter-category__text">Beauty & Salon</span>
                      </button>
                      <button className="filter-category__btn">
                        <BookOpen size={16} color="#6A7282" />
                        <span className="filter-category__text">Tutoring</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Distance radius */}
                  <div className="filter-section">
                    <div className="filter-section__header-row">
                      <h3 className="filter-section__title">Distance radius</h3>
                      <span className="filter-section__value" style={{ color: '#149114' }}>Within 5 km</span>
                    </div>
                    <div className="filter-slider">
                      <div className="filter-slider__track">
                        <div className="filter-slider__fill" style={{ width: '25%' }} />
                      </div>
                      <div className="filter-slider__thumb" style={{ left: '25%' }} />
                    </div>
                    <div className="filter-slider__labels">
                      <span>1 km</span>
                      <span>20 km</span>
                    </div>
                  </div>
                  
                  {/* Price range */}
                  <div className="filter-section">
                    <div className="filter-section__header-row">
                      <h3 className="filter-section__title">Price range</h3>
                      <span className="filter-section__value" style={{ color: '#364153' }}>LKR 500 – 10,000</span>
                    </div>
                    <div className="filter-slider">
                      <div className="filter-slider__track">
                        <div className="filter-slider__fill" style={{ left: '5%', width: '45%' }} />
                      </div>
                      <div className="filter-slider__thumb" style={{ left: '5%' }} />
                      <div className="filter-slider__thumb" style={{ left: '50%' }} />
                    </div>
                    <div className="filter-slider__labels">
                      <span>LKR 0</span>
                      <span>LKR 20,000</span>
                    </div>
                  </div>
                  
                  {/* Minimum rating */}
                  <div className="filter-section">
                    <h3 className="filter-section__title">Minimum rating</h3>
                    <div className="filter-rating__btn filter-rating__btn--active">
                      <div className="filter-rating__stars">
                        <Star size={18} fill="#F59E0B" color="#F59E0B" />
                        <Star size={18} fill="#F59E0B" color="#F59E0B" />
                        <Star size={18} fill="#F59E0B" color="#F59E0B" />
                        <Star size={18} fill="#F59E0B" color="#F59E0B" />
                        <Star size={18} fill="#E5E7EB" color="#E5E7EB" />
                      </div>
                      <span className="filter-rating__text">4.0 & up</span>
                      <div className="filter-category__check" style={{ marginLeft: 'auto' }}>
                        <Check size={8} color="#FFFFFF" strokeWidth={4} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div className="filter-section">
                    <h3 className="filter-section__title">Availability</h3>
                    <div className="filter-availability__row">
                      <button className="filter-availability__btn">Available today</button>
                      <button className="filter-availability__btn filter-availability__btn--active">Available this week</button>
                    </div>
                  </div>
                </div>
                
                <div className="filter-sidebar__footer">
                  <button className="filter-footer__clear" onClick={() => setIsFilterOpen(false)}>Clear all</button>
                  <button className="filter-footer__show" onClick={() => setIsFilterOpen(false)}>Show 6 providers</button>
                </div>
              </div>
            </>
          )}

          {isLoaded && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: isSearchingProviders ? 0.3 : 1, transition: 'opacity 0.3s', pointerEvents: isSearchingProviders ? 'none' : 'auto' }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={mapZoom}
                center={mapCenter}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                {/* Map Pins */}
                {filteredProviders.map(provider => {
                  const isActive = activeProviderId === provider.id;
                  return (
                    <OverlayView
                      key={provider.id}
                      position={{ lat: provider.lat, lng: provider.lng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div style={{ transform: 'translate(-50%, -100%)', position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        {/* Popup Card */}
                        {isActive && (
                          <div style={{ 
                            position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 16,
                            width: 320, background: '#FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08), 0px 16px 40px rgba(0, 0, 0, 0.12)',
                            borderRadius: 16, cursor: 'default', zIndex: 100
                          }}
                          onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 12 }}>
                              <button style={{ width: 28, height: 28, border: '0.8px solid #F3F4F6', borderRadius: '50%', background: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setActiveProviderId(null); }}>
                                <X size={13} color="#6B7280" />
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                              <div style={{ width: 48, height: 48, borderRadius: '50%', background: provider.color || '#7C3AED', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: provider.imageUrl ? `url(${provider.imageUrl})` : 'none', backgroundSize: 'cover', position: 'relative', color: '#FFF', fontWeight: 700, fontSize: 16 }}>
                                {provider.verified && (
                                  <div style={{ position: 'absolute', right: -4, bottom: -4, width: 16, height: 16, background: '#1ABA1A', border: '2px solid #FFFFFF', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Check size={10} color="white" strokeWidth={3} />
                                  </div>
                                )}
                                {!provider.imageUrl && provider.initials}
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#101828' }}>{provider.name}</h3>
                                <p style={{ margin: '2px 0 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#6A7282' }}>{provider.category}</p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                  <Star key={i} size={13} fill={i < Math.round(provider.rating) ? '#F59E0B' : '#E5E7EB'} color={i < Math.round(provider.rating) ? '#F59E0B' : '#E5E7EB'} />
                                ))}
                              </div>
                              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#1E2939' }}>{provider.rating.toFixed(1)}</span>
                              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#99A1AF' }}>({provider.reviewsCount} reviews)</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', gap: 4, background: '#E8FBE8', borderRadius: 20 }}>
                                <MapPin size={10} color="#149114" />
                                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12, color: '#149114' }}>{provider.distance || '2.4 km'} away</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={11} color="#9CA3AF" />
                                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#6A7282' }}>{provider.locationName}</span>
                              </div>
                            </div>
                            
                            <div style={{ width: '100%', height: 1, background: '#F3F4F6', marginBottom: 14 }} />
                            
                            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', width: '100%' }}>
                              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 12, color: '#99A1AF', marginRight: 8 }}>Starting from</span>
                              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: '#101828' }}>LKR {provider.startingPrice.toLocaleString()}</span>
                              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: '#99A1AF', marginLeft: 4 }}>/ visit</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                              <button 
                                style={{ flex: 1, height: 42, background: '#FFFFFF', border: '0.8px solid #E5E7EB', borderRadius: 24, fontWeight: 600, fontSize: 14, color: '#1E2939', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/providers/${provider.id}`); }}
                              >
                                View Profile
                              </button>
                              <button 
                                style={{ flex: 1, height: 42, background: '#1ABA1A', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 14, color: '#FFFFFF', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/booking/create/${provider.id}`); }}
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Map Pin itself */}
                        <div 
                          className={`find-services__pin ${isActive ? 'find-services__pin--active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleProviderSelect(provider); }}
                        >
                          {isActive && provider.imageUrl ? (
                            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #FFFFFF', boxShadow: '0 0 0 4px #1ABA1A', backgroundImage: `url(${provider.imageUrl})`, backgroundSize: 'cover' }} />
                          ) : (
                            <>
                              <div className="find-services__pin-bubble" style={{ backgroundColor: provider.color || '#1ABA1A' }}>
                                {provider.initials}
                              </div>
                              <div className="find-services__pin-tail" style={{ borderTopColor: provider.color || '#1ABA1A' }} />
                            </>
                          )}
                        </div>
                      </div>
                    </OverlayView>
                  );
                })}
              </GoogleMap>
            </div>
          )}

          {isSearchingProviders && (
            <div className="find-services__map-loading-overlay">
              <div className="find-services__map-loading-card">
                <div className="find-services__map-spinner">
                  <div className="spinner-ring" />
                  <div className="spinner-ring-gap" />
                  <div className="spinner-pin">
                    <MapPin size={16} fill="#1ABA1A" color="#FFFFFF" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="loading-text-container">
                  <h3 className="loading-title">Finding providers nearby…</h3>
                  <p className="loading-subtitle">Searching {searchQuery}</p>
                </div>
                <div className="loading-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          {!isSearchingProviders && filteredProviders.length === 0 && (
            <>
              {/* Map Radius UI */}
              <div className="find-services__map-radius-circle" style={{ width: searchRadius === 2 ? 280 : 500, height: searchRadius === 2 ? 280 : 500 }}></div>
              <div className="find-services__map-radius-center"></div>
              <div className="find-services__map-radius-label" style={{ left: searchRadius === 2 ? 'calc(50% + 140px)' : 'calc(50% + 250px)' }}>
                <div className="radius-label-line"></div>
                <div className="radius-label-text">Current radius: {searchRadius} km</div>
              </div>

              {/* Warning Banner */}
              <div className="find-services__map-empty-warning">
                <div className="warning-icon-bg">
                  <span style={{ fontWeight: 'bold' }}>!</span> 
                </div>
                <span className="warning-text">No service providers found in this area</span>
                <button className="warning-btn" onClick={() => setSearchRadius(10)}>Expand radius</button>
              </div>
            </>
          )}

        </div>
      </div>

      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        minRating={minRating}
        setMinRating={setMinRating}
      />
    </div>
  );
}
