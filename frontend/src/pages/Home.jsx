import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Clock3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const services = [
  {
    title: "Home Cleaning",
    price: "From LKR 3,500",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Electrical Services",
    price: "From LKR 2,500",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Plumbing Services",
    price: "From LKR 2,000",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
];

const providers = [
  {
    name: "CleanPro Services",
    category: "Home Cleaning",
    rating: "4.8",
    reviews: "124 reviews",
    location: "Colombo",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "FixFast Lanka",
    category: "Electrical Services",
    rating: "4.9",
    reviews: "98 reviews",
    location: "Kandy",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Pro Plumbing",
    category: "Plumbing",
    rating: "4.7",
    reviews: "87 reviews",
    location: "Gampaha",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=500&q=80",
  },
];

export default function Home() {
  return (
    <div className="cc-page">
      {/* TOP BAR */}
      <div className="cc-topbar">
        <div>Easy Service • 24/7</div>

        <div className="cc-topbar-links">
          <span>Become a Provider</span>
          <span>Help Center</span>
          <span>LKR</span>
          <span>English</span>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="cc-navbar">
        <Link to="/" className="cc-brand">
          <div className="cc-brand-icon">✓</div>

          <div>
            <div className="cc-brand-name">ClickCart</div>
            <div className="cc-brand-subtitle">Local Services</div>
          </div>
        </Link>

        <nav className="cc-nav-links">
          <Link className="active" to="/">
            Home
          </Link>
          <a href="#services">Find Services</a>
          <a href="#how">How It Works</a>
          <a href="#providers">Providers</a>
          <a href="#footer">Contact</a>
        </nav>

        <div className="cc-nav-actions">
          <Link to="/login" className="cc-login-btn">
            Login
          </Link>

          <Link to="/register" className="cc-post-btn">
            Post a Service
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="cc-hero">
        <div className="cc-hero-content">
          <span className="cc-hero-badge">
            <Sparkles size={15} />
            Trusted local services
          </span>

          <h1>
            Find the right service
            <span> near you.</span>
          </h1>

          <p>
            Connect with trusted local professionals for home, business and
            everyday services across Sri Lanka.
          </p>

          {/* SEARCH */}
          <div className="cc-search-box">
            <div className="cc-search-field">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search services, providers..."
              />
            </div>

            <div className="cc-search-location">
              <MapPin size={18} />
              <span>All Sri Lanka</span>
            </div>

            <button className="cc-search-btn">
              Search
            </button>
          </div>

          <div className="cc-hero-features">
            <div>
              <ShieldCheck size={18} />
              Verified Providers
            </div>

            <div>
              <Star size={18} />
              Rated Services
            </div>

            <div>
              <Clock3 size={18} />
              Easy Booking
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="cc-section" id="services">
        <div className="cc-section-heading">
          <div>
            <span>EXPLORE</span>
            <h2>Popular Services</h2>
          </div>

          <a href="#providers" className="cc-view-link">
            View all <ArrowRight size={15} />
          </a>
        </div>

        <div className="cc-service-grid">
          {services.map((service) => (
            <Link
              className="cc-service-card"
              to="/service/1"
              key={service.title}
            >
              <img src={service.image} alt={service.title} />

              <div className="cc-service-overlay">
                <h3>{service.title}</h3>
                <p>{service.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PROVIDERS */}
      <section className="cc-section cc-light-section" id="providers">
        <div className="cc-section-heading">
          <div>
            <span>TRUSTED PROFESSIONALS</span>
            <h2>Top Rated Providers</h2>
          </div>
        </div>

        <div className="cc-provider-grid">
          {providers.map((provider) => (
            <Link
              to="/provider/1"
              className="cc-provider-card"
              key={provider.name}
            >
              <img src={provider.image} alt={provider.name} />

              <div className="cc-provider-body">
                <div className="cc-provider-name-row">
                  <h3>{provider.name}</h3>
                  <ShieldCheck size={17} />
                </div>

                <p>{provider.category}</p>

                <div className="cc-rating">
                  <Star size={15} fill="currentColor" />
                  <strong>{provider.rating}</strong>
                  <span>{provider.reviews}</span>
                </div>

                <div className="cc-location">
                  <MapPin size={14} />
                  {provider.location}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="cc-section" id="how">
        <div className="cc-section-heading">
          <div>
            <span>SIMPLE PROCESS</span>
            <h2>How ClickCart Works</h2>
          </div>
        </div>

        <div className="cc-steps">
          <div className="cc-step">
            <div>01</div>
            <h3>Search</h3>
            <p>Find the service you need.</p>
          </div>

          <div className="cc-step">
            <div>02</div>
            <h3>Compare</h3>
            <p>Check providers, ratings and prices.</p>
          </div>

          <div className="cc-step">
            <div>03</div>
            <h3>Book</h3>
            <p>Choose a suitable time and book.</p>
          </div>

          <div className="cc-step">
            <div>04</div>
            <h3>Enjoy</h3>
            <p>Get your service from a trusted provider.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="cc-footer" id="footer">
        <div className="cc-footer-brand">
          <div className="cc-brand-icon">✓</div>

          <div>
            <strong>ClickCart</strong>
            <p>Connecting people with trusted local services.</p>
          </div>
        </div>

        <div className="cc-footer-copy">
          © 2026 ClickCart. All rights reserved.
        </div>
      </footer>
    </div>
  );
}