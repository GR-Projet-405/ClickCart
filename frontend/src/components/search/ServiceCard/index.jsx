import { ArrowRight, MapPin, Star } from "lucide-react";
import Avatar from "../../common/Avatar";
import Button from "../../common/Button";
import "../search.css";

export default function ServiceCard({ service, onViewService }) {
  const providerName = service.provider?.name || "Trusted provider";
  const businessName = service.provider?.businessName || "Local service provider";
  const priceFrom = Number(service.priceFrom ?? 0);
  const rating = Number(service.rating ?? 4.5);
  const reviewCount = Number(service.reviews ?? 0);

  return (
    <article className="marketplace-service-card">
      <div className="marketplace-service-card__image">
        {service.imageUrl ? (
          <img src={service.imageUrl} alt={service.title} loading="lazy" />
        ) : (
          <div className="marketplace-service-card__image--fallback" aria-hidden="true">
            {service.title?.slice(0, 1) || "S"}
          </div>
        )}
      </div>

      <div className="marketplace-service-card__content">
        <div className="marketplace-service-card__meta">
          <span className="marketplace-service-card__category">{service.category || "General"}</span>
          <span className="marketplace-service-card__rating">
            <Star size={14} fill="currentColor" color="var(--cc-warning)" />
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        <h3 className="marketplace-service-card__title">{service.title}</h3>

        <div className="marketplace-service-card__provider">
          <Avatar
            src={service.provider?.avatarUrl}
            alt={businessName}
            fallback={businessName?.charAt(0) || "P"}
            size="sm"
          />
          <div className="marketplace-service-card__provider-name">
            <strong>{providerName}</strong>
            <span>{businessName}</span>
          </div>
        </div>

        <div className="marketplace-service-card__rating">
          <MapPin size={14} />
          <span>{service.location || "Local area"}</span>
        </div>

        <p className="marketplace-service-card__description">{service.description}</p>

        <div className="marketplace-service-card__price">
          <strong>From LKR {priceFrom.toLocaleString("en-LK")}</strong>
          <Button variant="outline" size="sm" onClick={() => onViewService(service)} rightIcon={<ArrowRight size={14} />}>
            View Service
          </Button>
        </div>
      </div>
    </article>
  );
}
