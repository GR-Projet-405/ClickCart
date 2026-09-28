import React, { useState, useEffect } from 'react';
import { ShieldCheck, CalendarClock, Scale, Search, Sparkles, Loader2 } from 'lucide-react';
import RecommendedProviderCard from './RecommendedProviderCard';
import RecommendationFilters from './RecommendationFilters';
import MatchBreakdownModal from './MatchBreakdownModal';
import InstantDispatchModal from './InstantDispatchModal';
import ProviderProfileView from './ProviderProfileView';
import { fetchProviderMatches } from '../../services/recommendationsApi';

import './RecommendationsPage.css';
import acSolutionImg from '../../assets/images/recommendations/AC.jpg';
import plumberImg from '../../assets/images/recommendations/plumber1.jpg';
import electricianImg from '../../assets/images/recommendations/electrical.jpg';

// Fallback mock array
const fallbackMockRecommendations = [
  {
    id: 'PROV-100',
    businessName: 'ABC AC Solutions',
    serviceCategory: 'AC Repair',
    image: acSolutionImg,
    rating: 4.8,
    reviewCount: 126,
    distanceKm: 2.4,
    availability: 'Available Tomorrow',
    startingPrice: 2500,
    matchScore: 98,
    explainability: { requirementFit: 'Fits your saved appliance service history and location radius.' },
    isVerified: true,
  },
  {
    id: 'PROV-200',
    businessName: 'Panadura Pro Plumbing',
    serviceCategory: 'Plumbing',
    image: plumberImg,
    rating: 4.9,
    reviewCount: 184,
    distanceKm: 0.8,
    availability: 'Available Today / Tomorrow',
    startingPrice: 2000,
    matchScore: 99,
    explainability: { requirementFit: 'Servicing your exact postal neighborhood with lowest dispatch latency.' },
    isVerified: true,
  },
  {
    id: 'PROV-300',
    businessName: 'Lanka Electrical Hub',
    serviceCategory: 'Electrical',
    image: electricianImg,
    rating: 4.7,
    reviewCount: 92,
    distanceKm: 3.1,
    availability: 'Available Today',
    startingPrice: 3000,
    matchScore: 91,
    explainability: { requirementFit: 'Matches your requested residential maintenance category.' },
    isVerified: true,
  },
];

export default function RecommendationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match');
  
  const [providers, setProviders] = useState(fallbackMockRecommendations); // Default immediately to mocks so screen is never blank
  const [loading, setLoading] = useState(false);

  const [activeProviderForModal, setActiveProviderForModal] = useState(null);
  const [activeProviderForBooking, setActiveProviderForBooking] = useState(null);
  
  // Profile View States
  const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'profile'
  const [selectedProfileProvider, setSelectedProfileProvider] = useState(null);

  // Attempt backend fetch with a short timeout safeguard
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const serviceQuery = selectedCategory === 'All' ? 'Plumbing' : selectedCategory;
        
        // Wrap fetch in a timeout promise so it doesn't hang indefinitely if backend is down
        const fetchPromise = fetchProviderMatches(serviceQuery, 'Panadura Town', 10.0);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API Timeout')), 2000)
        );

        const data = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (isMounted) {
          if (data && data.length > 0) {
            setProviders(data);
          } else {
            setProviders(fallbackMockRecommendations);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable or timed out, using local mock recommendations:', err.message);
        if (isMounted) {
          setProviders(fallbackMockRecommendations);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const filteredProviders = providers
    .filter((provider) => {
      const categoryMatchTarget = provider.serviceCategory || provider.category || '';
      const matchesCategory = selectedCategory === 'All' || categoryMatchTarget.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const nameMatchTarget = provider.businessName || provider.name || '';
      const serviceMatchTarget = provider.serviceCategory || provider.service || '';
      
      const matchesSearch =
        nameMatchTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceMatchTarget.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const scoreA = a.matchScore || 0;
      const scoreB = b.matchScore || 0;
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      const distA = a.distanceKm !== undefined ? a.distanceKm : (a.distance || 0);
      const distB = b.distanceKm !== undefined ? b.distanceKm : (b.distance || 0);
      const priceA = a.startingPrice || 0;
      const priceB = b.startingPrice || 0;

      if (sortBy === 'match') return scoreB - scoreA;
      if (sortBy === 'rating') return ratingB - ratingA;
      if (sortBy === 'distance') return distA - distB;
      if (sortBy === 'price-low') return priceA - priceB;
      return 0;
    });

  // Render Provider Profile View if toggled
  if (viewMode === 'profile' && selectedProfileProvider) {
    return (
      <ProviderProfileView
        provider={{
          ...selectedProfileProvider,
          name: selectedProfileProvider.businessName || selectedProfileProvider.name,
          service: selectedProfileProvider.serviceCategory || selectedProfileProvider.service,
          distance: selectedProfileProvider.distanceKm !== undefined ? selectedProfileProvider.distanceKm : selectedProfileProvider.distance
        }}
        onBack={() => setViewMode('feed')}
        onBookService={(prov) => setActiveProviderForBooking(prov)}
      />
    );
  }

  return (
    <main className="dev15-recommendations-container">
      <header className="dev15-header">
        <span className="dev15-badge-text">
          <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
          CURATED MATCHES
        </span>
        <h1>Recommended for You</h1>
        <p>
          Algorithmic matches computed from your recent activity, real-time availability in
          Panadura, and verified skill badges.
        </p>
      </header>

      <div className="dev15-search-filter-wrapper">
        <div className="dev15-search-box">
          <Search size={18} className="dev15-search-icon" />
          <input
            type="text"
            placeholder="Search by provider name or specific service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <RecommendationFilters
        activeFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
        activeSort={sortBy}
        onSortChange={setSortBy}
      />

      <section className="dev15-grid">
        {loading && providers.length === 0 ? (
          <div className="dev15-empty-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
            <Loader2 className="animate-spin" size={24} />
            <p>Computing optimal matches from database...</p>
          </div>
        ) : filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => {
            const mappedProvider = {
              ...provider,
              name: provider.businessName || provider.name,
              service: provider.serviceCategory || provider.service,
              category: provider.serviceCategory || provider.category,
              distance: provider.distanceKm !== undefined ? provider.distanceKm : provider.distance,
              matchedTag: provider.explainability?.requirementFit || provider.matchedTag || 'Matches your residential service profile.',
              image: provider.image || plumberImg
            };
            return (
              <RecommendedProviderCard
                key={provider.id || provider.businessName}
                provider={mappedProvider}
                onShowBreakdown={(prov) => setActiveProviderForModal(prov)}
                onBookNow={(prov) => setActiveProviderForBooking(prov)}
                onShowProfile={(prov) => {
                  setSelectedProfileProvider(prov);
                  setViewMode('profile');
                }}
              />
            );
          })
        ) : (
          <div className="dev15-empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No verified providers found matching your criteria.</p>
          </div>
        )}
      </section>

      <section className="dev15-explainer-section">
        <span className="dev15-badge-text dev15-text-success">ZERO BLACK-BOX LOGIC</span>
        <h2>How ClickCart Recommendations Work</h2>
        <p className="dev15-explainer-subtitle">
          Unlike ordinary directories, our feed uses mathematical proximity and verified merit
          rather than sponsored ad bidding.
        </p>

        <div className="dev15-explainer-grid">
          <div className="dev15-explainer-card">
            <div className="dev15-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h4>Step 01: Verified Credentials</h4>
            <p>
              Every professional must pass national identity validation, municipal trade
              registrations, and reference checks before entering the algorithmic pool.
            </p>
          </div>
          <div className="dev15-explainer-card">
            <div className="dev15-icon-wrapper">
              <CalendarClock size={24} />
            </div>
            <h4>Step 02: Real-Time Availability</h4>
            <p>
              We sync directly with provider dispatch calendars so you see live open slots for
              today and tomorrow.
            </p>
          </div>
          <div className="dev15-explainer-card">
            <div className="dev15-icon-wrapper">
              <Scale size={24} />
            </div>
            <h4>Step 03: Fair & Transparent</h4>
            <p>
              Providers cannot pay to leapfrog the recommendation queue. Matches are purely driven
              by verified customer satisfaction, proximity, and price consistency.
            </p>
          </div>
        </div>
      </section>

      <MatchBreakdownModal
        provider={activeProviderForModal}
        onClose={() => setActiveProviderForModal(null)}
      />

      <InstantDispatchModal
        provider={activeProviderForBooking}
        onClose={() => setActiveProviderForBooking(null)}
        onSuccess={() => setActiveProviderForBooking(null)}
      />
    </main>
  );
}