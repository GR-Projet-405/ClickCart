import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Car,
  Droplet,
  GraduationCap,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import Button from "../../components/common/Button";
import { aiSearchApi } from "../../services/aiSearchService";
import { AI_CATEGORY_GROUPS } from "../../config/serviceCategories";
import "./ai-service-search.css";

// Resolves the icon name stored in config/serviceCategories.js to a component.
const CATEGORY_ICONS = { Wrench, Zap, GraduationCap, Car, Sparkles, Droplet };

function formatPrice(service) {
  if (service.priceFrom == null && service.priceTo == null) {
    return "Contact for pricing";
  }
  const format = (amount) =>
    new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number(amount));
  const from = format(service.priceFrom ?? service.priceTo);
  const to = format(service.priceTo ?? service.priceFrom);
  return from === to ? `LKR ${from}` : `LKR ${from} – ${to}`;
}

function ServiceIcon({ category }) {
  const group = AI_CATEGORY_GROUPS.find((item) => item.label === category);
  const Icon = CATEGORY_ICONS[group?.icon] || Wrench;
  return <Icon size={34} strokeWidth={1.6} />;
}

function ResultCard({ service, onSelect }) {
  return (
    <article className="ai-search-card">
      <div className="ai-search-card__art">
        {service.imageUrl ? (
          <img src={service.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="ai-search-card__art-icon" aria-hidden="true">
            <ServiceIcon category={service.category} />
          </div>
        )}
        <span className="ai-search-card__match">
          <Sparkles size={12} /> {service.matchScore}% AI Match
        </span>
      </div>

      <div className="ai-search-card__body">
        <h3>{service.title}</h3>

        {service.providerName && (
          <div className="ai-search-card__provider">
            <span className="ai-search-card__provider-avatar" aria-hidden="true">
              {service.providerName.charAt(0).toUpperCase()}
            </span>
            <span>{service.providerName}</span>
            {service.providerVerified && (
              <ShieldCheck size={14} className="ai-search-card__verified" aria-label="Verified provider" />
            )}
          </div>
        )}

        <div className="ai-search-card__meta">
          <MapPin size={13} />
          <span>
            {service.location || service.category}
            {service.distanceKm != null && ` • ${service.distanceKm} km away`}
          </span>
        </div>

        {service.rating != null && (
          <div className="ai-search-card__rating">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={13}
                fill={index < Math.round(service.rating) ? "currentColor" : "none"}
              />
            ))}
            {service.reviewCount != null && <span>{service.reviewCount} reviews</span>}
          </div>
        )}

        <div className="ai-search-card__footer">
          <div className="ai-search-card__price">
            <strong>{formatPrice(service)}</strong>
            <small>starting price</small>
          </div>
          <Button size="sm" rightIcon={<ArrowRight size={14} />} onClick={() => onSelect(service)}>
            View &amp; Book
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function AiServiceSearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(nextQuery) {
    setLoading(true);
    setError("");
    try {
      const { results: found, categories } = await aiSearchApi.search(nextQuery);
      setResults(found);
      setSuggestedCategories(categories || []);
      setSubmittedQuery(nextQuery);
      setHasSearched(true);
    } catch (reason) {
      setError(reason.message || "We couldn't run that search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setActiveCategory(null);
    runSearch(query);
  }

  const visibleResults = useMemo(() => {
    if (!activeCategory) return results;
    return results.filter((service) => service.category === activeCategory);
  }, [results, activeCategory]);

  return (
    <section className="ai-search-page">
      <div className="ai-search-container">
        <header className="ai-search-heading">
          <h1>Tell us what you need done.</h1>
          <p>Describe your problem in plain language — our AI finds the right category and matches you with nearby providers.</p>
        </header>

        <form className="ai-search-bar" onSubmit={handleSubmit} role="search">
          <label className="ai-search-bar__field">
            <Sparkles size={16} className="ai-search-bar__sparkle" aria-hidden="true" />
            <input
              type="search"
              placeholder='Try "AC repair near Malabe, tomorrow morning"'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Describe the service you need"
            />
          </label>
          <Button type="submit" leftIcon={<Search size={16} />} loading={loading}>
            Search
          </Button>
        </form>
        <p className="ai-search-caption">
          <Sparkles size={12} /> Powered by AI — understands natural-language requests, no category picking needed.
        </p>

        {hasSearched && suggestedCategories.length > 0 && (
          <section className="ai-search-categories" aria-label="AI suggested categories">
            <h2>
              <Sparkles size={16} /> AI Suggested Categories
            </h2>
            <p>Based on your search — tap a category to refine results</p>
            <div className="ai-search-categories__list">
              {suggestedCategories.map((label) => {
                const group = AI_CATEGORY_GROUPS.find((item) => item.label === label);
                const Icon = CATEGORY_ICONS[group?.icon] || Wrench;
                const active = activeCategory === label;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`ai-search-chip${active ? " ai-search-chip--active" : ""}`}
                    onClick={() => setActiveCategory(active ? null : label)}
                  >
                    <Icon size={16} /> {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {hasSearched && (
          <section className="ai-search-results">
            <div className="ai-search-results__heading">
              <h2>
                <Sparkles size={16} /> AI-Powered Results
              </h2>
              <span>Sorted by AI relevance</span>
            </div>
            <p className="ai-search-results__subtitle">
              Showing matches for &ldquo;{submittedQuery || "all services"}&rdquo;
            </p>

            {error ? (
              <div className="ai-search-message ai-search-message--error" role="alert">
                <AlertCircle size={24} />
                <h3>We couldn&apos;t load results</h3>
                <p>{error}</p>
              </div>
            ) : loading ? (
              <div className="ai-search-loading" role="status">
                <LoaderCircle size={26} />
                <span>Finding the best matches…</span>
              </div>
            ) : visibleResults.length === 0 ? (
              <div className="ai-search-message">
                <Search size={24} />
                <h3>No matches yet</h3>
                <p>Try a different phrase, or remove the category filter.</p>
              </div>
            ) : (
              <div className="ai-search-grid">
                {visibleResults.map((service) => (
                  <ResultCard key={service.id} service={service} onSelect={() => {}} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  );
}
