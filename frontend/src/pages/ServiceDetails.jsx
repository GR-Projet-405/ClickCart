import { useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";

import {
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import "react-calendar/dist/Calendar.css";
import "./ServiceDetails.css";

/* =========================
   AVAILABLE DATES
========================= */

const dates = [
  { day: "Wed", date: "23" },
  { day: "Thu", date: "24" },
  { day: "Fri", date: "25" },
  { day: "Sat", date: "26" },
  { day: "Sun", date: "27" },
  { day: "Mon", date: "28" },
];

/* =========================
   AVAILABLE TIME SLOTS
========================= */

const timeSlots = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

/* =========================
   REVIEWS
========================= */

const reviews = [
  {
    name: "Amaya Perera",
    rating: 5,
    text: "Very professional and friendly service. The house was cleaned really well.",
  },
  {
    name: "Kasun Silva",
    rating: 5,
    text: "Good communication and arrived on time. I will definitely book again.",
  },
  {
    name: "Nethmi Fernando",
    rating: 4,
    text: "Quality service at a reasonable price. Very happy with the result.",
  },
];

export default function ServiceDetails() {

  /* =========================
     SELECTED DATE & TIME
  ========================= */

 const [selectedDate, setSelectedDate] = useState("23");
const [selectedDay, setSelectedDay] = useState("Wed");

const [selectedTime, setSelectedTime] = useState("10:00 AM");

/* Full calendar selected date */
const [calendarDate, setCalendarDate] = useState(new Date(2026, 8, 23));
  /* =========================
     BOOKING FUNCTION
  ========================= */

  const handleBooking = () => {
    alert(
      `Booking Selected!\n\nDate: ${selectedDay}, September ${selectedDate}, 2026\nTime: ${selectedTime}`
    );
  };
const handleCalendarChange = (date) => {
  setCalendarDate(date);

  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
  });

  const dateNumber = date.getDate().toString();

  setSelectedDay(day);
  setSelectedDate(dateNumber);
};
  return (
    <div className="service-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sd-navbar">

        {/* LOGO */}

        <Link to="/" className="sd-logo">

          <div className="sd-logo-icon">
            ✓
          </div>

          <div>
            <strong>ClickCart</strong>
            <span>Local Services</span>
          </div>

        </Link>

        {/* NAVIGATION */}

        <nav className="sd-nav">

          <Link to="/">
            Home
          </Link>

          <Link to="/">
            Find Services
          </Link>

          <Link to="/">
            How It Works
          </Link>

          <Link to="/">
            Providers
          </Link>

          <Link to="/">
            Contact
          </Link>

        </nav>

        {/* ACTIONS */}

        <div className="sd-actions">

          <Link
            to="/login"
            className="sd-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="sd-post"
          >
            Post a Service
          </Link>

        </div>

      </header>


      {/* =====================================================
          SEARCH BAR
      ====================================================== */}

      <div className="sd-search-area">

        <div className="sd-search">

          <input
            type="text"
            placeholder="Search services, providers, locations..."
          />

          <div className="sd-location">

            <MapPin size={15} />

            <span>
              All Sri Lanka
            </span>

          </div>

          <button>
            Search
          </button>

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="sd-container">


        {/* =================================================
            BREADCRUMB
        ================================================== */}

        <div className="sd-breadcrumb">

          <Link to="/">
            Home
          </Link>

          <ChevronRight size={13} />

          <Link to="/provider/1">
            Services
          </Link>

          <ChevronRight size={13} />

          <strong>
            Home Cleaning
          </strong>

        </div>


        {/* =================================================
            MAIN GRID
        ================================================== */}

        <section className="sd-main-grid">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="sd-left">


            {/* =============================================
                SERVICE IMAGE
            ============================================== */}

            <div className="sd-image-card">

              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85"
                alt="Professional Home Cleaning"
              />

              <div className="sd-image-badge">

                <CheckCircle size={14} />

                Verified Service

              </div>

            </div>


            {/* =============================================
                SERVICE TITLE
            ============================================== */}

            <div className="sd-service-title">

              <div className="sd-category">
                HOME CLEANING
              </div>

              <h1>
                Professional Home Cleaning
              </h1>


              {/* RATING */}

              <div className="sd-rating-row">

                <span className="sd-stars">

                  <Star size={16} fill="currentColor" />

                  <Star size={16} fill="currentColor" />

                  <Star size={16} fill="currentColor" />

                  <Star size={16} fill="currentColor" />

                  <Star size={16} fill="currentColor" />

                </span>

                <strong>
                  4.8
                </strong>

                <span className="sd-reviews">
                  124 reviews
                </span>

                <span className="sd-divider">
                  |
                </span>

                <span className="sd-location-text">

                  <MapPin size={14} />

                  Colombo

                </span>

              </div>


              {/* DESCRIPTION */}

              <p className="sd-description">

                Professional home cleaning service for houses,
                apartments and small offices. Our experienced team
                uses quality cleaning products and follows a reliable
                cleaning process to make your space fresh, clean and
                comfortable.

              </p>

            </div>


            {/* =================================================
                SERVICE INCLUDES
            ================================================== */}

            <section className="sd-section">

              <div className="sd-section-title">

                <span></span>

                <h2>
                  Service Includes
                </h2>

              </div>


              <div className="sd-includes">

                <div>
                  <CheckCircle size={16} />
                  Living room cleaning
                </div>

                <div>
                  <CheckCircle size={16} />
                  Bedroom cleaning
                </div>

                <div>
                  <CheckCircle size={16} />
                  Kitchen cleaning
                </div>

                <div>
                  <CheckCircle size={16} />
                  Bathroom cleaning
                </div>

                <div>
                  <CheckCircle size={16} />
                  Floor cleaning
                </div>

                <div>
                  <CheckCircle size={16} />
                  Dust removal
                </div>

              </div>

            </section>


            {/* =================================================
                AVAILABILITY
            ================================================== */}

            <section className="sd-section">


              {/* SECTION HEADER */}

              <div className="sd-section-heading">

                <div>

                  <div className="sd-section-title">

                    <span></span>

                    <h2>
                      Availability
                    </h2>

                  </div>

                  <p>
                    Select your preferred date and time
                  </p>

                </div>


                <div className="sd-month">
                  September 2026
                </div>

              </div>

{/* FULL CALENDAR */}

<div className="sd-calendar-box">

  <div className="sd-calendar-header">

    <div>
      <span>Select another date</span>
      <strong>Choose your preferred booking date</strong>
    </div>

    <CalendarDays size={20} />

  </div>

  <Calendar
    onChange={handleCalendarChange}
    value={calendarDate}
    minDate={new Date()}
    minDetail="month"
    maxDetail="month"
    showNeighboringMonth={true}
  />

</div>
              {/* =============================================
                  DATE BUTTONS
              ============================================== */}

              <div className="sd-dates">

                {dates.map((item) => (

                  <button
                    type="button"
                    key={item.date}
                    className={
                      selectedDate === item.date
                        ? "sd-date active"
                        : "sd-date"
                    }
                   onClick={() => {

  setSelectedDate(item.date);

  setSelectedDay(item.day);

  setCalendarDate(
    new Date(
      2026,
      8,
      Number(item.date)
    )
  );

}}
                  >

                    <span>
                      {item.day}
                    </span>

                    <strong>
                      {item.date}
                    </strong>

                  </button>

                ))}

              </div>


              {/* =============================================
                  TIME TITLE
              ============================================== */}

              <div className="sd-time-title">

                <Clock3 size={16} />

                Available Time Slots

              </div>


              {/* =============================================
                  TIME SLOTS
              ============================================== */}

              <div className="sd-time-grid">

                {timeSlots.map((time) => (

                  <button
                    type="button"
                    key={time}
                    className={
                      selectedTime === time
                        ? "sd-time active"
                        : "sd-time"
                    }
                    onClick={() =>
                      setSelectedTime(time)
                    }
                  >

                    {time}

                  </button>

                ))}

              </div>

            </section>


            {/* =================================================
                CUSTOMER REVIEWS
            ================================================== */}

            <section className="sd-section">

              <div className="sd-section-title">

                <span></span>

                <h2>
                  Customer Reviews
                </h2>

              </div>


              {/* REVIEW SUMMARY */}

              <div className="sd-review-summary">

                <div className="sd-big-rating">

                  <strong>
                    4.8
                  </strong>

                  <div className="sd-summary-stars">

                    <Star
                      size={17}
                      fill="currentColor"
                    />

                    <Star
                      size={17}
                      fill="currentColor"
                    />

                    <Star
                      size={17}
                      fill="currentColor"
                    />

                    <Star
                      size={17}
                      fill="currentColor"
                    />

                    <Star
                      size={17}
                      fill="currentColor"
                    />

                  </div>

                  <span>
                    124 reviews
                  </span>

                </div>


                {/* RATING BARS */}

                <div className="sd-rating-bars">

                  <div>

                    <span>
                      5
                    </span>

                    <div>
                      <i style={{ width: "88%" }}></i>
                    </div>

                  </div>


                  <div>

                    <span>
                      4
                    </span>

                    <div>
                      <i style={{ width: "65%" }}></i>
                    </div>

                  </div>


                  <div>

                    <span>
                      3
                    </span>

                    <div>
                      <i style={{ width: "25%" }}></i>
                    </div>

                  </div>


                  <div>

                    <span>
                      2
                    </span>

                    <div>
                      <i style={{ width: "10%" }}></i>
                    </div>

                  </div>


                  <div>

                    <span>
                      1
                    </span>

                    <div>
                      <i style={{ width: "5%" }}></i>
                    </div>

                  </div>

                </div>

              </div>


              {/* REVIEW LIST */}

              <div className="sd-reviews-list">

                {reviews.map((review) => (

                  <div
                    className="sd-review"
                    key={review.name}
                  >

                    <div className="sd-review-avatar">
                      {review.name.charAt(0)}
                    </div>


                    <div className="sd-review-content">

                      <div className="sd-review-top">

                        <strong>
                          {review.name}
                        </strong>


                        <span>

                          {Array.from({
                            length: review.rating,
                          }).map((_, index) => (

                            <Star
                              key={index}
                              size={13}
                              fill="currentColor"
                            />

                          ))}

                        </span>

                      </div>


                      <p>
                        {review.text}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="sd-sidebar">


            {/* =================================================
                BOOKING CARD
            ================================================== */}

            <div className="sd-book-card">

              <div className="sd-price-label">
                Starting from
              </div>

              <div className="sd-price">
                LKR 3,500
              </div>

              <div className="sd-price-note">
                Per standard cleaning session
              </div>


              <div className="sd-card-divider"></div>


              {/* SELECTED DATE */}

              <div className="sd-selected-info">

                <div>

                  <CalendarDays size={16} />

                 <span>
  <small>
    Selected Date
  </small>

  {calendarDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })}
</span>

                </div>


                {/* SELECTED TIME */}

                <div>

                  <Clock3 size={16} />

                  <span>

                    <small>
                      Selected Time
                    </small>

                    {selectedTime}

                  </span>

                </div>

              </div>


              {/* BOOK BUTTON */}

              <button
                type="button"
                className="sd-book-btn"
                onClick={handleBooking}
              >
                Book This Service
              </button>


              {/* MESSAGE */}

              <button
                type="button"
                className="sd-message-btn"
              >

                <MessageCircle size={15} />

                Message Provider

              </button>


              {/* SECURITY */}

              <div className="sd-safe-booking">

                <ShieldCheck size={16} />

                <div>

                  <strong>
                    Safe & Secure Booking
                  </strong>

                  <span>
                    Your information is protected.
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                PROVIDER CARD
            ================================================== */}

            <div className="sd-provider-card">

              <h3>
                About the Provider
              </h3>


              <div className="sd-provider-top">

                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=80"
                  alt="CleanPro Services"
                />


                <div>

                  <strong>
                    CleanPro Services
                  </strong>


                  <span className="sd-provider-verified">

                    <CheckCircle size={13} />

                    Verified Provider

                  </span>


                  <div className="sd-provider-rating">

                    <Star
                      size={13}
                      fill="currentColor"
                    />

                    4.8

                    <span>
                      (124)
                    </span>

                  </div>

                </div>

              </div>


              <div className="sd-provider-location">

                <MapPin size={14} />

                Colombo, Sri Lanka

              </div>


              <Link
                to="/provider/1"
                className="sd-view-provider"
              >

                View Provider Profile

                <ChevronRight size={14} />

              </Link>

            </div>


            {/* =================================================
                WHY CHOOSE CLICKCART
            ================================================== */}

            <div className="sd-why-card">

              <h3>
                Why Choose ClickCart?
              </h3>


              <div>

                <ShieldCheck size={17} />

                Verified providers

              </div>


              <div>

                <CheckCircle size={17} />

                Transparent pricing

              </div>


              <div>

                <UserRound size={17} />

                Trusted customer reviews

              </div>


              <div>

                <CalendarDays size={17} />

                Easy online booking

              </div>

            </div>

          </aside>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="sd-footer">

        <div>

          <strong>
            ClickCart
          </strong>

          <span>
            Connecting you with trusted local services.
          </span>

        </div>

        <p>
          © 2026 ClickCart. All rights reserved.
        </p>

      </footer>

    </div>
  );
}