import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  Heart,
  Info,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import Card from "../../common/Card";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import Avatar from "../../common/Avatar";
import { getFavorites, removeFavorite } from "../../../services/favoritesApi";
import "./styles.css";

export default function CustomerFavoritesSection({
  profile,
  onShowToast,
  onUpdateFavoritesCount,
  initialSubTab = "services",
}) {
  const navigate = useNavigate();

  const [subTab, setSubTab] = useState(initialSubTab); // "services" | "providers"
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Modal for quick details preview
  const [previewItem, setPreviewItem] = useState(null);

  const customerId = profile?.id || "mock-customer-001";

  // Load favorites from backend API
  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFavorites(customerId);
      setFavorites(Array.isArray(data) ? data : []);
      if (onUpdateFavoritesCount) {
        onUpdateFavoritesCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Failed to load customer favorites:", err);
      setError(err.message || "Failed to load favorites from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [customerId]);

  // Separate saved services vs saved providers
  const savedServices = useMemo(() => {
    return favorites.filter(
      (f) => (f.targetType || "").toUpperCase() === "SERVICE"
    );
  }, [favorites]);

  const savedProviders = useMemo(() => {
    return favorites.filter(
      (f) => (f.targetType || "").toUpperCase() === "PROVIDER"
    );
  }, [favorites]);

  // Current active list
  const currentList = subTab === "services" ? savedServices : savedProviders;

  // Extract unique categories for current tab
  const availableCategories = useMemo(() => {
    const set = new Set();
    currentList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [currentList]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...currentList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const providerName = (item.providerName || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const location = (item.location || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        return (
          title.includes(q) ||
          providerName.includes(q) ||
          category.includes(q) ||
          location.includes(q) ||
          description.includes(q)
        );
      });
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "RATING_HIGH") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "NAME_ASC") {
        return (a.title || a.providerName || "").localeCompare(
          b.title || b.providerName || ""
        );
      }
      if (sortBy === "PRICE_LOW") {
        const pA = parseInt((a.price || "").replace(/\D/g, "")) || 0;
        const pB = parseInt((b.price || "").replace(/\D/g, "")) || 0;
        return pA - pB;
      }
      if (sortBy === "PRICE_HIGH") {
        const pA = parseInt((a.price || "").replace(/\D/g, "")) || 0;
        const pB = parseInt((b.price || "").replace(/\D/g, "")) || 0;
        return pB - pA;
      }
      // NEWEST default: by createdAt or id
      return (b.id || "").localeCompare(a.id || "");
    });

    return result;
  }, [currentList, searchQuery, selectedCategory, sortBy]);

  // Handle Remove Favorite
  const handleRemoveFavorite = async (item, e) => {
    e && e.stopPropagation();
    const typeLabel =
      item.targetType === "SERVICE" ? "Service" : "Provider";
    const itemTitle = item.title || item.providerName || "Item";

    // Optimistic UI update
    const previousFavorites = [...favorites];
    const updated = favorites.filter((f) => f.id !== item.id && f.targetId !== item.targetId);
    setFavorites(updated);
    if (onUpdateFavoritesCount) {
      onUpdateFavoritesCount(updated.length);
    }

    try {
      await removeFavorite(item.targetType, item.targetId, customerId);
      if (onShowToast) {
        onShowToast(`Removed "${itemTitle}" from saved ${typeLabel.toLowerCase()}s.`);
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setFavorites(previousFavorites); // Revert on failure
      if (onShowToast) {
        onShowToast(`Could not remove ${itemTitle}. Reverted changes.`, "warning");
      }
    }
  };

  const handleBookService = (item) => {
    // Navigate to booking creation flow with preselected service / provider
    navigate("/booking/create", {
      state: {
        serviceId: item.targetId,
        serviceTitle: item.title,
        providerName: item.providerName,
        price: item.price,
        category: item.category,
      },
    });
  };

  const handleBookProvider = (provider) => {
    navigate("/booking/create", {
      state: {
        providerId: provider.targetId,
        providerName: provider.providerName || provider.title,
        specialty: provider.category,
      },
    });
  };

  const handleMessageProvider = (provider) => {
    navigate("/messages", {
      state: {
        recipientId: provider.targetId,
        recipientName: provider.providerName || provider.title,
      },
    });
  };

  const handleViewProviderProfile = (provider) => {
    navigate(`/providers/${provider.targetId}`);
  };

  return (
    <div className="customer-favorites-section">
      <Card className="customer-favorites-section__card">
        {/* Section Header */}
        <div className="customer-favorites-section__header">
          <div className="customer-favorites-section__title-group">
            <div className="customer-favorites-section__icon-badge">
              <Heart size={22} fill="#ef4444" color="#ef4444" />
            </div>
            <div>
              <h2 className="customer-favorites-section__title">
                Favorites & Saved Services
              </h2>
              <p className="customer-favorites-section__desc">
                Access your bookmarked home services and trusted top-rated providers in one place.
              </p>
            </div>
          </div>

          <div className="customer-favorites-section__stats-strip">
            <span className="customer-favorites-section__stat-pill">
              <Sparkles size={14} color="var(--cc-primary)" />
              Saved Services: <strong>{savedServices.length}</strong>
            </span>
            <span className="customer-favorites-section__stat-pill">
              <UserCheck size={14} color="#7c3aed" />
              Saved Providers: <strong>{savedProviders.length}</strong>
            </span>
          </div>
        </div>

        {/* Tab Switcher: Saved Services vs Saved Providers */}
        <div className="customer-favorites-section__tab-bar">
          <button
            type="button"
            className={`customer-favorites-section__tab-btn ${
              subTab === "services" ? "active" : ""
            }`}
            onClick={() => {
              setSubTab("services");
              setSelectedCategory("ALL");
            }}
          >
            <Layers size={16} />
            <span>Saved Services</span>
            <span className="customer-favorites-section__count-tag">
              {savedServices.length}
            </span>
          </button>
          <button
            type="button"
            className={`customer-favorites-section__tab-btn ${
              subTab === "providers" ? "active" : ""
            }`}
            onClick={() => {
              setSubTab("providers");
              setSelectedCategory("ALL");
            }}
          >
            <Briefcase size={16} />
            <span>Saved Providers</span>
            <span className="customer-favorites-section__count-tag">
              {savedProviders.length}
            </span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="customer-favorites-section__toolbar">
          <div className="customer-favorites-section__search-wrap">
            <Search size={16} className="customer-favorites-section__search-icon" />
            <input
              type="text"
              placeholder={`Search ${
                subTab === "services" ? "saved services by name, tag..." : "providers by name, specialty..."
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customer-favorites-section__search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="customer-favorites-section__search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="customer-favorites-section__actions-row">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="customer-favorites-section__sort-select"
              aria-label="Sort favorites"
            >
              <option value="NEWEST">Sort: Recently Added</option>
              <option value="RATING_HIGH">Sort: Highest Rated</option>
              {subTab === "services" && (
                <>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                </>
              )}
              <option value="NAME_ASC">Name: A to Z</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={loadFavorites}
              title="Refresh favorites from database"
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Category Pills (if more than 1 category) */}
        {availableCategories.length > 2 && (
          <div className="customer-favorites-section__categories">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`customer-favorites-section__category-chip ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Content State Handling */}
        {isLoading ? (
          <div className="customer-favorites-section__empty">
            <RefreshCw size={32} className="customer-profile-page__spinner" />
            <p className="cc-text-secondary">Loading saved {subTab} from database...</p>
          </div>
        ) : error ? (
          <div className="customer-favorites-section__empty">
            <AlertCircle size={32} color="var(--cc-error)" />
            <p className="cc-text-secondary">{error}</p>
            <Button variant="outline" size="sm" onClick={loadFavorites}>
              Try Again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty State
          <div className="customer-favorites-section__empty">
            <div className="customer-favorites-section__empty-icon">
              <Heart size={32} fill="#ef4444" color="#ef4444" />
            </div>
            {searchQuery || selectedCategory !== "ALL" ? (
              <>
                <h3 className="customer-favorites-section__empty-title">
                  No matching {subTab} found
                </h3>
                <p className="customer-favorites-section__empty-desc">
                  No saved {subTab} match your current search query "{searchQuery}" or category filter.
                </p>
                <div className="customer-favorites-section__empty-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </>
            ) : subTab === "services" ? (
              <>
                <h3 className="customer-favorites-section__empty-title">
                  No Saved Services Yet
                </h3>
                <p className="customer-favorites-section__empty-desc">
                  You haven't saved any services to your favorites. Browse the marketplace and click the heart icon to save services for fast booking later!
                </p>
                <div className="customer-favorites-section__empty-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={15} />}
                    onClick={() => navigate("/find-services")}
                  >
                    Browse Services Marketplace
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="customer-favorites-section__empty-title">
                  No Saved Providers Yet
                </h3>
                <p className="customer-favorites-section__empty-desc">
                  You haven't saved any service providers yet. Check out top-rated professionals in your city and bookmark your favorites.
                </p>
                <div className="customer-favorites-section__empty-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={15} />}
                    onClick={() => navigate("/recommendations")}
                  >
                    Discover Recommended Pros
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : subTab === "services" ? (
          /* ========================================================== */
          /* SAVED SERVICES GRID                                        */
          /* ========================================================== */
          <div className="customer-favorites-section__services-grid">
            {filteredItems.map((item) => (
              <article key={item.id || item.targetId} className="service-fav-card">
                <div className="service-fav-card__media-wrap">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400&h=250"
                    }
                    alt={item.title}
                    className="service-fav-card__image"
                    loading="lazy"
                  />
                  {item.category && (
                    <span className="service-fav-card__category-badge">
                      {item.category}
                    </span>
                  )}
                  <button
                    type="button"
                    className="service-fav-card__heart-btn"
                    title="Remove from favorites"
                    onClick={(e) => handleRemoveFavorite(item, e)}
                  >
                    <Heart size={18} fill="#ef4444" color="#ef4444" />
                  </button>
                </div>

                <div className="service-fav-card__content">
                  <h3 className="service-fav-card__title">{item.title}</h3>

                  <div className="service-fav-card__provider-row">
                    <CheckCircle2 size={14} color="var(--cc-success)" />
                    <span>{item.providerName || "Verified Provider"}</span>
                  </div>

                  <div className="service-fav-card__meta-row">
                    <div className="service-fav-card__rating">
                      <Star size={14} fill="#eab308" color="#eab308" />
                      <span>{item.rating ? item.rating.toFixed(1) : "4.8"}</span>
                      {item.reviewsCount && (
                        <span className="service-fav-card__reviews-count">
                          ({item.reviewsCount})
                        </span>
                      )}
                    </div>

                    {item.location && (
                      <div className="service-fav-card__location" title={item.location}>
                        <MapPin size={13} />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  {item.availability && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <Badge variant="success" size="sm">
                        {item.availability}
                      </Badge>
                    </div>
                  )}

                  <div className="service-fav-card__price-row">
                    <span className="service-fav-card__price-label">Starting at</span>
                    <strong className="service-fav-card__price-val">
                      {item.price || "LKR 2,500"}
                    </strong>
                  </div>

                  <div className="service-fav-card__actions">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CalendarCheck size={14} />}
                      onClick={() => handleBookService(item)}
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      onClick={() => setPreviewItem(item)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ========================================================== */
          /* SAVED PROVIDERS GRID                                       */
          /* ========================================================== */
          <div className="customer-favorites-section__providers-grid">
            {filteredItems.map((provider) => (
              <article key={provider.id || provider.targetId} className="provider-fav-card">
                <button
                  type="button"
                  className="provider-fav-card__heart-btn"
                  title="Remove provider from favorites"
                  onClick={(e) => handleRemoveFavorite(provider, e)}
                >
                  <Heart size={20} fill="#ef4444" color="#ef4444" />
                </button>

                <div className="provider-fav-card__top">
                  <div className="provider-fav-card__avatar-box">
                    <img
                      src={
                        provider.image ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400"
                      }
                      alt={provider.providerName || provider.title}
                      className="provider-fav-card__avatar"
                    />
                    <span className="provider-fav-card__online-dot" title="Available" />
                  </div>

                  <div className="provider-fav-card__info">
                    <div className="provider-fav-card__name-row">
                      <h3 className="provider-fav-card__name">
                        {provider.providerName || provider.title}
                      </h3>
                      <ShieldCheck size={16} color="var(--cc-success)" />
                    </div>
                    <p className="provider-fav-card__specialty">
                      {provider.category || "Professional Service Provider"}
                    </p>
                  </div>
                </div>

                <div className="provider-fav-card__badge-row">
                  {provider.badge && (
                    <Badge variant="primary" size="sm">
                      <Sparkles size={11} style={{ marginRight: 3 }} />
                      {provider.badge}
                    </Badge>
                  )}
                  {provider.availability && (
                    <Badge variant="success" size="sm">
                      {provider.availability}
                    </Badge>
                  )}
                </div>

                <div className="provider-fav-card__highlights">
                  <div className="provider-fav-card__highlight-item">
                    <span className="provider-fav-card__highlight-label">Rating</span>
                    <span className="provider-fav-card__highlight-val">
                      ★ {provider.rating ? provider.rating.toFixed(2) : "4.90"}{" "}
                      <small style={{ fontWeight: "normal", color: "var(--cc-text-muted)" }}>
                        ({provider.reviewsCount || 45})
                      </small>
                    </span>
                  </div>
                  <div className="provider-fav-card__highlight-item">
                    <span className="provider-fav-card__highlight-label">Rate / Hour</span>
                    <span className="provider-fav-card__highlight-val" style={{ color: "var(--cc-primary-dark)" }}>
                      {provider.price || "LKR 2,500 / hr"}
                    </span>
                  </div>
                </div>

                {provider.location && (
                  <div className="provider-fav-card__location-row">
                    <MapPin size={14} color="var(--cc-text-muted)" />
                    <span>{provider.location}</span>
                  </div>
                )}

                <div className="provider-fav-card__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Calendar size={14} />}
                    onClick={() => handleBookProvider(provider)}
                  >
                    Book Pro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<MessageSquare size={14} />}
                    onClick={() => handleMessageProvider(provider)}
                  >
                    Chat
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

      </Card>

      {/* Details Preview Modal */}
      {previewItem && (
        <div
          className="customer-favorites-modal-overlay"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="customer-favorites-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="customer-favorites-modal__header">
              <h3 className="cc-h3" style={{ margin: 0 }}>
                {previewItem.title}
              </h3>
              <button
                type="button"
                className="customer-favorites-modal__close-btn"
                onClick={() => setPreviewItem(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="customer-favorites-modal__body">
              {previewItem.image && (
                <img
                  src={previewItem.image}
                  alt={previewItem.title}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                  }}
                />
              )}

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {previewItem.category && (
                  <Badge variant="primary">{previewItem.category}</Badge>
                )}
                {previewItem.badge && (
                  <Badge variant="success">{previewItem.badge}</Badge>
                )}
              </div>

              <p style={{ color: "var(--cc-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
                {previewItem.description ||
                  "Quality assured home service delivered by top-rated certified professionals with ClickCart guarantee."}
              </p>

              <div
                style={{
                  background: "var(--cc-bg-muted)",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", display: "block" }}>
                    Service Rate
                  </span>
                  <strong style={{ fontSize: "1.125rem", color: "var(--cc-primary-dark)" }}>
                    {previewItem.price || "LKR 2,500"}
                  </strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", display: "block" }}>
                    Provider
                  </span>
                  <strong style={{ fontSize: "0.875rem", color: "var(--cc-text-primary)" }}>
                    {previewItem.providerName}
                  </strong>
                </div>
              </div>
            </div>

            <div className="customer-favorites-modal__footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewItem(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CalendarCheck size={14} />}
                onClick={() => {
                  setPreviewItem(null);
                  handleBookService(previewItem);
                }}
              >
                Proceed to Book
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
