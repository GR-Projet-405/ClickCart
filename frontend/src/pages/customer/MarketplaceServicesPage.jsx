import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Search, Wrench, X } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import ActiveFilterChips from "../../components/search/ActiveFilterChips";
import FilterSidebar from "../../components/search/FilterSidebar";
import ServiceCard from "../../components/search/ServiceCard";
import SortDropdown from "../../components/search/SortDropdown";
import { marketplaceServicesApi } from "../../services/marketplaceServices";
import "../../components/search/search.css";
import "./marketplace-services.css";

const DEFAULT_MIN_PRICE = 500;
const DEFAULT_MAX_PRICE = 15000;
const PAGE_SIZE = 6;

function formatPrice(service) {
  if (service.priceFrom == null || service.priceTo == null) {
    return "Contact for pricing";
  }

  const format = (amount) =>
    new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number(amount));

  const from = format(service.priceFrom);
  const to = format(service.priceTo);
  return from === to ? `LKR ${from}` : `LKR ${from} – ${to}`;
}

function ServiceArtwork({ service }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (service.imageUrl && !imageFailed) {
    return <img src={service.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />;
  }
  return (
    <div className="marketplace-service-artwork" aria-hidden="true">
      <Wrench size={38} strokeWidth={1.4} />
    </div>
  );
}

function ServiceDetails({ service, onClose }) {
  return (
    <div
      className="marketplace-service-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="marketplace-service-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketplace-details-title"
      >
        <div className="marketplace-service-dialog__art">
          <ServiceArtwork service={service} />
        </div>
        <button className="marketplace-service-dialog__close" type="button" aria-label="Close" onClick={onClose}>
          <X size={19} />
        </button>
        <div className="marketplace-service-dialog__body">
          <span className="marketplace-service-category">{service.category}</span>
          <h2 id="marketplace-details-title">{service.title}</h2>
          <p>{service.description}</p>
          <strong>
            {formatPrice(service)}
            {service.priceUnit && <small> {service.priceUnit}</small>}
          </strong>
        </div>
      </section>
    </div>
  );
}

function normalizeService(service) {
  const priceFrom = Number(service.priceFrom ?? service.priceTo ?? 0);
  const priceTo = Number(service.priceTo ?? service.priceFrom ?? priceFrom);

  return {
    ...service,
    category: service.category || "General",
    title: service.title || "Service listing",
    description: service.description || "Explore this local service.",
    priceFrom,
    priceTo,
    location: service.location || service.serviceArea || "Local area",
    rating: Number(service.rating ?? service.averageRating ?? 4.5) || 4.5,
    reviews: Number(service.reviews ?? service.reviewCount ?? service.totalReviews ?? 0) || 0,
    provider: service.provider || {
      name: "Trusted local provider",
      businessName: "Local service provider",
      avatarUrl: "",
    },
  };
}

function parseAvailability(service) {
  const raw = String(service.availability || service.nextAvailable || "").trim().toLowerCase();
  if (!raw) {
    return null;
  }

  if (raw.includes("today") || raw.includes("tomorrow")) {
    return "today-or-tomorrow";
  }

  if (raw.includes("3 day") || raw.includes("within 3")) {
    return "within-3-days";
  }

  return raw;
}

function getEffectivePriceRange(service) {
  const low = Number(service.priceFrom ?? service.priceTo ?? 0) || 0;
  const high = Number(service.priceTo ?? service.priceFrom ?? low) || low;
  return { low, high };
}

function matchesAvailability(service, label) {
  const availability = parseAvailability(service);
  if (!availability) {
    return false;
  }

  if (label === "Today/Tomorrow") {
    return availability === "today-or-tomorrow";
  }

  if (label === "Within 3 Days") {
    return availability === "within-3-days";
  }

  return false;
}

export default function MarketplaceServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [location, setLocation] = useState("All locations");
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);

  const loadServices = async (nextParams = {}) => {
    setLoading(true);
    setError("");

    try {
      const items = await marketplaceServicesApi.listActive(nextParams);
      setServices(items.map(normalizeService));
    } catch (reason) {
      setServices([]);
      setError(reason.message || "Services could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      q: query.trim() || undefined,
      category: category !== "All categories" ? category : undefined,
      location: location !== "All locations" ? location : undefined,
      minPrice: minPrice !== DEFAULT_MIN_PRICE ? minPrice : undefined,
      maxPrice: maxPrice !== DEFAULT_MAX_PRICE ? maxPrice : undefined,
      minRating: selectedRatings.length ? Math.min(...selectedRatings) : undefined,
      availability: selectedAvailability.length ? selectedAvailability.join(",") : undefined,
      sort: sortBy !== "relevance" ? sortBy : undefined,
    };

    // TODO: move these filters and sort to the server once the backend supports them.
    loadServices(params);
  }, [category, location, maxPrice, minPrice, query, selectedAvailability, selectedRatings, sortBy]);

  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category).filter(Boolean))].sort(),
    [services],
  );

  const locations = useMemo(
    () => [...new Set(services.map((service) => service.location).filter(Boolean))].sort(),
    [services],
  );

  const baseSearchServices = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch =
        !search || [service.title, service.category, service.description].some((value) => value?.toLowerCase().includes(search));
      if (!matchesSearch) {
        return false;
      }

      if (category !== "All categories" && service.category !== category) {
        return false;
      }

      if (location !== "All locations" && !String(service.location || "").toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      const { low, high } = getEffectivePriceRange(service);
      if (low > maxPrice || high < minPrice) {
        return false;
      }

      return true;
    });
  }, [category, location, maxPrice, minPrice, query, services]);

  const ratingOptions = useMemo(() => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };

    baseSearchServices.forEach((service) => {
      const rating = Number(service.rating ?? 0);
      if (rating >= 4) counts[4] += 1;
      if (rating >= 3) counts[3] += 1;
      if (rating >= 2) counts[2] += 1;
      if (rating >= 1) counts[1] += 1;
    });

    return [
      { label: "4+ Stars", value: 4, count: counts[4] },
      { label: "3+ Stars", value: 3, count: counts[3] },
      { label: "2+ Stars", value: 2, count: counts[2] },
      { label: "1+ Stars", value: 1, count: counts[1] },
    ];
  }, [baseSearchServices]);

  const availabilityOptions = useMemo(() => {
    const counts = {
      "Today/Tomorrow": 0,
      "Within 3 Days": 0,
    };

    baseSearchServices.forEach((service) => {
      if (matchesAvailability(service, "Today/Tomorrow")) counts["Today/Tomorrow"] += 1;
      if (matchesAvailability(service, "Within 3 Days")) counts["Within 3 Days"] += 1;
    });

    return [
      { label: "Today/Tomorrow", value: "Today/Tomorrow", count: counts["Today/Tomorrow"] },
      { label: "Within 3 Days", value: "Within 3 Days", count: counts["Within 3 Days"] },
    ];
  }, [baseSearchServices]);

  const filteredServices = useMemo(() => {
    let result = [...baseSearchServices];

    if (selectedRatings.length > 0) {
      const minRequired = Math.min(...selectedRatings);
      result = result.filter((service) => Number(service.rating ?? 0) >= minRequired);
    }

    if (selectedAvailability.length > 0) {
      result = result.filter((service) =>
        selectedAvailability.some((option) => matchesAvailability(service, option)),
      );
    }

    if (sortBy === "price-low-to-high") {
      result.sort((left, right) => getEffectivePriceRange(left).low - getEffectivePriceRange(right).low);
    } else if (sortBy === "price-high-to-low") {
      result.sort((left, right) => getEffectivePriceRange(right).low - getEffectivePriceRange(left).low);
    } else if (sortBy === "rating") {
      result.sort((left, right) => Number(right.rating ?? 0) - Number(left.rating ?? 0));
    }

    return result;
  }, [baseSearchServices, selectedAvailability, selectedRatings, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const pagedServices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredServices]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, location, maxPrice, minPrice, query, selectedAvailability, selectedRatings, sortBy]);

  const activeFilters = useMemo(() => {
    const items = [];

    if (category !== "All categories") {
      items.push({ id: "category", label: `Category: ${category}` });
    }

    if (location !== "All locations") {
      items.push({ id: "location", label: `Location: ${location}` });
    }

    if (minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE) {
      items.push({ id: "price", label: `Price: LKR ${minPrice.toLocaleString("en-LK")} – ${maxPrice.toLocaleString("en-LK")}` });
    }

    selectedRatings.forEach((value) => {
      items.push({ id: `rating-${value}`, label: `${value}+ Stars` });
    });

    selectedAvailability.forEach((value) => {
      items.push({ id: `availability-${value}`, label: value });
    });

    return items;
  }, [category, location, maxPrice, minPrice, selectedAvailability, selectedRatings]);

  const removeFilter = (type) => {
    if (type === "category") {
      setCategory("All categories");
    }

    if (type === "location") {
      setLocation("All locations");
    }

    if (type === "price") {
      setMinPrice(DEFAULT_MIN_PRICE);
      setMaxPrice(DEFAULT_MAX_PRICE);
    }

    if (type.startsWith("rating-")) {
      setSelectedRatings((current) => current.filter((item) => String(item) !== String(type.replace("rating-", ""))));
    }

    if (type.startsWith("availability-")) {
      setSelectedAvailability((current) => current.filter((item) => item !== type.replace("availability-", "")));
    }
  };

  const toggleRating = (value) => {
    setSelectedRatings((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value].sort((left, right) => right - left),
    );
  };

  const toggleAvailability = (value) => {
    setSelectedAvailability((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const clearAllFilters = () => {
    setCategory("All categories");
    setLocation("All locations");
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSelectedRatings([]);
    setSelectedAvailability([]);
    setCurrentPage(1);
  };

  const hasSearchQuery = query.trim().length > 0;

  return (
    <section className="marketplace-services-page">
      <div className="marketplace-services-container">
        <header className="marketplace-services-heading">
          <span>LOCAL SERVICES, MADE SIMPLE</span>
          <h1>Find Services</h1>
          <p>Discover trusted local services for the jobs that matter to you.</p>
        </header>

        <section className="marketplace-services-search" aria-label="Search services">
          <label>
            <Search size={18} />
            <input
              type="search"
              placeholder="What service do you need?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search services"
            />
          </label>
          <label className="marketplace-services-category">
            <span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="All categories">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="marketplace-search-layout">
          <div className="marketplace-search-results-header">
            <nav className="marketplace-search-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/find-services">Find services</Link>
              <span>/</span>
              <span className="current">Search results</span>
            </nav>

            <div className="marketplace-results-summary">
              <h2>{hasSearchQuery ? `Search Results for "${query}"` : "Search Results"}</h2>
              <p>Showing {filteredServices.length} results</p>
            </div>

            <ActiveFilterChips filters={activeFilters} onRemove={removeFilter} />
          </div>

          <div className="marketplace-results-shell">
            <FilterSidebar
              category={category}
              onCategoryChange={setCategory}
              location={location}
              onLocationChange={setLocation}
              locations={locations}
              categories={categories}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              ratingOptions={ratingOptions.map((option) => ({
                ...option,
                value: {
                  checked: selectedRatings.includes(option.value),
                  onChange: () => toggleRating(option.value),
                },
              }))}
              availabilityOptions={availabilityOptions.map((option) => ({
                ...option,
                value: {
                  checked: selectedAvailability.includes(option.value),
                  onChange: () => toggleAvailability(option.value),
                },
              }))}
              onClearAll={clearAllFilters}
            />

            <div className="marketplace-search-main">
              <div className="marketplace-search-toolbar">
                <span className="marketplace-search-toolbar__meta">Showing {filteredServices.length} results</span>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>

              {error ? (
                <section className="marketplace-services-message marketplace-services-message--error" role="alert">
                  <AlertCircle size={24} />
                  <h2>We couldn’t load services</h2>
                  <p>{error}</p>
                </section>
              ) : loading ? (
                <div className="marketplace-services-loading" role="status">
                  <Spinner size="md" label="Loading services" />
                  <span>Loading services</span>
                </div>
              ) : services.length === 0 ? (
                <EmptyState
                  icon={<Search size={24} />}
                  title="No services available yet"
                  description="New local service listings will appear here when providers publish them."
                />
              ) : filteredServices.length === 0 ? (
                <EmptyState
                  icon={<Search size={24} />}
                  title="No services found"
                  description="Try changing your search or removing some filters."
                  action={
                    <div className="marketplace-empty-actions">
                      <Button variant="primary" size="md" onClick={clearAllFilters}>
                        Clear All Filters
                      </Button>
                      <Link to="/find-services">Browse All Services</Link>
                    </div>
                  }
                />
              ) : (
                <>
                  <div className="marketplace-results-grid">
                    {pagedServices.map((service) => (
                      <ServiceCard key={service.id} service={service} onViewService={setSelectedService} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="marketplace-pagination" aria-label="Pagination">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          className={page === currentPage ? "is-active" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedService && <ServiceDetails service={selectedService} onClose={() => setSelectedService(null)} />}
    </section>
  );
}
