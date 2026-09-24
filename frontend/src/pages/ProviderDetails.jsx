import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";

import "./ProviderDetails.css";

const services = [
  {
    name: "Home Cleaning",
    price: "From LKR 3,500",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Deep Cleaning",
    price: "From LKR 6,000",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Office Cleaning",
    price: "From LKR 5,000",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
];

const portfolio = [
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
];

export default function ProviderDetails() {
  return (
    <div className="provider-page">

      {/* NAVBAR */}
      <header className="pd-navbar">
        <Link to="/" className="pd-logo">
          <div className="pd-logo-icon">✓</div>

          <div>
            <strong>ClickCart</strong>
            <span>Local Services</span>
          </div>
        </Link>

        <nav className="pd-nav">
          <Link to="/">Home</Link>
          <Link to="/">Find Services</Link>
          <Link to="/">How It Works</Link>
          <Link to="/">Providers</Link>
        </nav>

        <div className="pd-actions">
          <Link to="/login" className="pd-login">
            Login
          </Link>

          <Link to="/register" className="pd-post">
            Post a Service
          </Link>
        </div>
      </header>

      {/* GREEN SEARCH AREA */}
      <div className="pd-search-area">
        <div className="pd-search">
          <input placeholder="Search services, providers..." />

          <div className="pd-search-location">
            <MapPin size={15} />
            All Sri Lanka
          </div>

          <button>Search</button>
        </div>
      </div>

      <main className="pd-container">

        {/* BREADCRUMB */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <span>Providers</span>
          <ChevronRight size={13} />
          <strong>CleanPro Services</strong>
        </div>

        {/* PROVIDER HERO */}
        <section className="pd-profile">

          <div className="pd-profile-image">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80"
              alt="CleanPro Services"
            />
          </div>

          <div className="pd-profile-info">

            <div className="pd-name-line">
              <h1>CleanPro Services</h1>

              <span className="pd-verified">
                <CheckCircle size={16} />
                Verified
              </span>
            </div>

            <p className="pd-category">
              Professional Home & Office Cleaning
            </p>

            <div className="pd-rating">
              <Star size={17} fill="#f5b400" />
              <strong>4.8</strong>
              <span>124 reviews</span>
            </div>

            <div className="pd-location">
              <MapPin size={16} />
              Colombo, Sri Lanka
            </div>

            <div className="pd-open">
              <span className="pd-online-dot"></span>
              Available today
            </div>
          </div>

          <div className="pd-contact-area">
            <button className="pd-message">
              <MessageCircle size={16} />
              Message
            </button>

            <button className="pd-contact">
              <Phone size={16} />
              Contact Provider
            </button>
          </div>

        </section>

        {/* TWO COLUMN CONTENT */}
        <div className="pd-layout">

          {/* LEFT */}
          <div>

            {/* ABOUT */}
            <section className="pd-section">

              <div className="pd-section-title">
                <span></span>
                <h2>About Provider</h2>
              </div>

              <p className="pd-about">
                CleanPro Services provides professional home and office
                cleaning services with trained staff and quality cleaning
                products. We focus on reliable service, affordable pricing
                and customer satisfaction.
              </p>

              <div className="pd-benefits">

                <div>
                  <CheckCircle size={17} />
                  Trusted professionals
                </div>

                <div>
                  <CheckCircle size={17} />
                  Quality cleaning products
                </div>

                <div>
                  <CheckCircle size={17} />
                  Flexible booking
                </div>

                <div>
                  <CheckCircle size={17} />
                  Customer support
                </div>

              </div>

            </section>

            {/* SERVICES */}
            <section className="pd-section">

              <div className="pd-section-heading">
                <div>
                  <div className="pd-section-title">
                    <span></span>
                    <h2>Services Offered</h2>
                  </div>

                  <p>Professional services offered by this provider</p>
                </div>

                <Link to="/service/1">
                  View all
                  <ChevronRight size={15} />
                </Link>
              </div>

              <div className="pd-service-grid">

                {services.map((service) => (
                  <Link
                    to="/service/1"
                    className="pd-service-card"
                    key={service.name}
                  >
                    <img src={service.image} alt={service.name} />

                    <div className="pd-service-body">
                      <h3>{service.name}</h3>

                      <p>{service.price}</p>

                      <div className="pd-card-bottom">
                        <span>View details</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </Link>
                ))}

              </div>

            </section>

            {/* PORTFOLIO */}
            <section className="pd-section">

              <div className="pd-section-title">
                <span></span>
                <h2>Our Work</h2>
              </div>

              <p className="pd-small-description">
                Some of our recently completed projects
              </p>

              <div className="pd-portfolio">

                {portfolio.map((image, index) => (
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    key={image}
                  />
                ))}

              </div>

            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside>

            {/* QUICK INFO */}
            <div className="pd-side-card">

              <h3>Provider Information</h3>

              <div className="pd-info-row">
                <Clock3 size={17} />
                <div>
                  <span>Response time</span>
                  <strong>Within 1 hour</strong>
                </div>
              </div>

              <div className="pd-info-row">
                <MapPin size={17} />
                <div>
                  <span>Service area</span>
                  <strong>Colombo & nearby</strong>
                </div>
              </div>

              <div className="pd-info-row">
                <Mail size={17} />
                <div>
                  <span>Email</span>
                  <strong>hello@cleanpro.lk</strong>
                </div>
              </div>

            </div>

            {/* WORKING HOURS */}
            <div className="pd-side-card">

              <h3>Working Hours</h3>

              <div className="pd-hours">
                <span>Monday</span>
                <strong>8:00 AM - 5:00 PM</strong>
              </div>

              <div className="pd-hours">
                <span>Tuesday</span>
                <strong>8:00 AM - 5:00 PM</strong>
              </div>

              <div className="pd-hours">
                <span>Wednesday</span>
                <strong>8:00 AM - 5:00 PM</strong>
              </div>

              <div className="pd-hours">
                <span>Thursday</span>
                <strong>8:00 AM - 5:00 PM</strong>
              </div>

              <div className="pd-hours">
                <span>Friday</span>
                <strong>8:00 AM - 5:00 PM</strong>
              </div>

              <div className="pd-hours">
                <span>Saturday</span>
                <strong>8:00 AM - 2:00 PM</strong>
              </div>

              <div className="pd-hours closed">
                <span>Sunday</span>
                <strong>Closed</strong>
              </div>

            </div>

            {/* SERVICE AREAS */}
            <div className="pd-side-card">

              <h3>Service Areas</h3>

              <div className="pd-chips">
                <span>Colombo</span>
                <span>Dehiwala</span>
                <span>Nugegoda</span>
                <span>Maharagama</span>
              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="pd-footer">
        <div>
          <strong>ClickCart</strong>
          <span>Connecting you with trusted local services.</span>
        </div>

        <p>© 2026 ClickCart. All rights reserved.</p>
      </footer>

    </div>
  );
}