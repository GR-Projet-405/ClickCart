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
import { SERVICE_CATEGORIES } from "../../config/serviceCategories";
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

function mapSelectedAvailability(selectedAvailability) {
  if (!selectedAvailability.length) {
    return undefined;
  }

  // Prefer the broader "within_3_days" filter when both availability options are selected,
  // because it covers both the Today/Tomorrow and Within 3 Days match windows.
  if (selectedAvailability.includes("Within 3 Days")) {
    return "within_3_days";
  }

  if (selectedAvailability.includes("Today/Tomorrow")) {
    return "today_tomorrow";
  }

  return undefined;
}

export default function MarketplaceServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All categories");
  const [location, setLocation] = useState("All locations");
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [catalogServices, setCatalogServices] = useState([]);

  const loadCatalogServices = async () => {
    try {
      const response = await marketplaceServicesApi.listActive({ page: 0, size: 200 });
      const items = Array.isArray(response?.content) ? response.content : [];
      setCatalogServices(items.map(normalizeService));
    } catch (reason) {
      setCatalogServices([]);
    }
  };

  const loadServices = async (nextParams = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await marketplaceServicesApi.listActive(nextParams);
      const items = Array.isArray(response?.content) ? response.content : [];
      setServices(items.map(normalizeService));
      setTotalElements(Number(response?.totalElements ?? items.length));
      const serverPage = Number(response?.page ?? 0);
      if (Number.isFinite(serverPage) && serverPage >= 0) {
        setCurrentPage(serverPage + 1);
      }
    } catch (reason) {
      setServices([]);
      setTotalElements(0);
      setError(reason.message || "Services could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogServices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, location, maxPrice, minPrice, selectedAvailability, selectedRatings, sortBy]);

  useEffect(() => {
    const supportedSortValues = new Set(["relevance", "price_asc", "price_desc", "rating"]);
    const normalizedSortBy = supportedSortValues.has(sortBy) ? sortBy : undefined;

    const params = {
      category: category !== "All categories" ? category : undefined,
      location: location !== "All locations" ? location : undefined,
      minPrice: minPrice !== DEFAULT_MIN_PRICE ? minPrice : undefined,
      maxPrice: maxPrice !== DEFAULT_MAX_PRICE ? maxPrice : undefined,
      minRating: selectedRatings.length ? Math.min(...selectedRatings) : undefined,
      availability: mapSelectedAvailability(selectedAvailability),
      sortBy: normalizedSortBy,
      page: Math.max(currentPage - 1, 0),
      size: PAGE_SIZE,
    };

    loadServices(params);
  }, [category, location, maxPrice, minPrice, selectedAvailability, selectedRatings, sortBy, currentPage]);

  const categories = useMemo(
    () =>
      [...new Set([...SERVICE_CATEGORIES, ...catalogServices.map((service) => service.category).filter(Boolean)])].sort(),
    [catalogServices],
  );

  const locations = useMemo(
    () => [...new Set(catalogServices.map((service) => service.location).filter(Boolean))].sort(),
    [catalogServices],
  );

  const ratingOptions = useMemo(
    () => [
      { label: "4+ Stars", value: 4, count: 0 },
      { label: "3+ Stars", value: 3, count: 0 },
      { label: "2+ Stars", value: 2, count: 0 },
      { label: "1+ Stars", value: 1, count: 0 },
    ],
    [],
  );

  const availabilityOptions = useMemo(
    () => [
      { label: "Today/Tomorrow", value: "Today/Tomorrow", count: 0 },
      { label: "Within 3 Days", value: "Within 3 Days", count: 0 },
    ],
    [],
  );

  const totalPages = Math.max(0, Math.ceil(totalElements / PAGE_SIZE));

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

  return (
    <section className="marketplace-services-page">
      <div className="marketplace-services-container">
        <header className="marketplace-services-heading">
          <span>LOCAL SERVICES, MADE SIMPLE</span>
          <h1>Find Services</h1>
          <p>Discover trusted local services for the jobs that matter to you.</p>
        </header>

        <div className="marketplace-services-search-row">
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
          <Link
            to="/find-services/ai-search"
            className="cc-button cc-button--primary cc-button--md marketplace-ai-search-link"
          >
            Try AI-Powered Search
          </Link>
        </div>

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
              <h2>Available Services</h2>
              <p>Showing {totalElements} results</p>
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
                <span className="marketplace-search-toolbar__meta">Showing {totalElements} results</span>
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
              ) : totalElements === 0 ? (
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
                    {services.map((service) => (
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
