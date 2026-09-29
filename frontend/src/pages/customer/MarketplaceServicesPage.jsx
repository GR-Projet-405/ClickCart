import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, LoaderCircle, Search, Wrench, X } from "lucide-react";
import { marketplaceServicesApi } from "../../services/marketplaceServices";
import "./marketplace-services.css";

function formatPrice(service) {
  if (service.priceFrom == null || service.priceTo == null) return "Contact for pricing";
  const format = (amount) => new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number(amount));
  const from = format(service.priceFrom);
  const to = format(service.priceTo);
  return from === to ? `LKR ${from}` : `LKR ${from} – ${to}`;
}

function ServiceArtwork({ service }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (service.imageUrl && !imageFailed) {
    return <img src={service.imageUrl} alt="" loading="lazy" onError={() => setImageFailed(true)} />;
  }
  return <div className="marketplace-service-artwork" aria-hidden="true"><Wrench size={38} strokeWidth={1.4} /></div>;
}

function ServiceDetails({ service, onClose }) {
  return (
    <div className="marketplace-service-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="marketplace-service-dialog" role="dialog" aria-modal="true" aria-labelledby="marketplace-details-title">
        <div className="marketplace-service-dialog__art"><ServiceArtwork service={service} /></div>
        <button className="marketplace-service-dialog__close" type="button" aria-label="Close" onClick={onClose}><X size={19} /></button>
        <div className="marketplace-service-dialog__body">
          <span className="marketplace-service-category">{service.category}</span>
          <h2 id="marketplace-details-title">{service.title}</h2>
          <p>{service.description}</p>
          <strong>{formatPrice(service)}{service.priceUnit && <small> {service.priceUnit}</small>}</strong>
        </div>
      </section>
    </div>
  );
}

export default function MarketplaceServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    let active = true;
    marketplaceServicesApi.listActive()
      .then((items) => { if (active) setServices(items); })
      .catch((reason) => { if (active) setError(reason.message || "Services could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category))].sort(), [services]);
  const visibleServices = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch = !search || [service.title, service.category, service.description]
        .some((value) => value?.toLowerCase().includes(search));
      return matchesSearch && (category === "All categories" || service.category === category);
    });
  }, [services, query, category]);

  return (
    <section className="marketplace-services-page">
      <div className="marketplace-services-container">
        <header className="marketplace-services-heading">
          <span>LOCAL SERVICES, MADE SIMPLE</span>
          <h1>Find Services</h1>
          <p>Discover trusted local services for the jobs that matter to you.</p>
        </header>

        <section className="marketplace-services-search" aria-label="Search services">
          <label><Search size={18} /><input type="search" placeholder="What service do you need?" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search services" /></label>
          <label className="marketplace-services-category"><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        </section>

        <div className="marketplace-services-results">
          <h2>{loading ? "Finding services…" : `${visibleServices.length} ${visibleServices.length === 1 ? "service" : "services"} available`}</h2>
          <span>In your local marketplace</span>
        </div>

        {error ? (
          <section className="marketplace-services-message marketplace-services-message--error" role="alert"><AlertCircle size={24} /><h2>We couldn’t load services</h2><p>{error}</p></section>
        ) : loading ? (
          <div className="marketplace-services-loading" role="status"><LoaderCircle size={28} /><span>Loading services</span></div>
        ) : visibleServices.length === 0 ? (
          <section className="marketplace-services-message"><div><Search size={25} /></div><h2>{services.length === 0 ? "No services available yet" : "No services match your search"}</h2><p>{services.length === 0 ? "New local service listings will appear here when providers publish them." : "Try a different search or category."}</p></section>
        ) : (
          <div className="marketplace-services-grid">
            {visibleServices.map((service) => (
              <article className="marketplace-service-card" key={service.id}>
                <div className="marketplace-service-card__art"><ServiceArtwork service={service} /></div>
                <div className="marketplace-service-card__body">
                  <span className="marketplace-service-category">{service.category}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <strong>{formatPrice(service)}{service.priceUnit && <small> {service.priceUnit}</small>}</strong>
                </div>
                <footer><button type="button" onClick={() => setSelectedService(service)}>View details <ArrowRight size={15} /></button></footer>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedService && <ServiceDetails service={selectedService} onClose={() => setSelectedService(null)} />}
    </section>
  );
}
