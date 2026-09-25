import React from "react";
import { useMemo, useState } from "react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Field from "../../../components/common/Field/Field";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Textarea from "../../../components/common/Textarea";
import Button from "../../../components/common/Button";
import "../../../styles/booking-creation.css";

const bookingTimeSlots = [
  { value: "09:00 AM", status: "available" },
  { value: "11:00 AM", status: "available" },
  { value: "02:00 PM", status: "available" },
  { value: "04:00 PM", status: "unavailable" },
];
const bookingServices = [
  {
    value: "home-cleaning",
    label: "Home Cleaning",
    serviceFee: 150,
    materials: 25,
    travel: 20,
    estimatedTotal: 195,
  },
  {
    value: "plumbing-service",
    label: "Plumbing Service",
    serviceFee: 180,
    materials: 40,
    travel: 25,
    estimatedTotal: 245,
  },
  {
    value: "electrical-repair",
    label: "Electrical Repair",
    serviceFee: 210,
    materials: 35,
    travel: 20,
    estimatedTotal: 265,
  },
  {
    value: "ac-service",
    label: "AC Service",
    serviceFee: 190,
    materials: 30,
    travel: 25,
    estimatedTotal: 245,
  },
];
const bookingProviders = [
  { value: "abc-home-services", label: "ABC Home Services", rating: 4.8, initials: "AH" },
  { value: "quickfix-services", label: "QuickFix Services", rating: 4.6, initials: "QF" },
  { value: "citycare-services", label: "CityCare Services", rating: 4.9, initials: "CC" },
];
const bookingAddresses = [
  { value: "home-123-main-street", label: "Home - 123 Main Street, Colombo" },
  { value: "office-45-galle-road", label: "Office - 45 Galle Road, Colombo" },
];
const contactMethods = ["Phone", "Email"];

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function BookingCreation() {
  const [selectedService, setSelectedService] = useState("home-cleaning");
  const [selectedProvider, setSelectedProvider] = useState("abc-home-services");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const selectedServiceDetails = useMemo(
    () => bookingServices.find((service) => service.value === selectedService) ?? bookingServices[0],
    [selectedService]
  );
  const selectedProviderDetails = useMemo(
    () => bookingProviders.find((provider) => provider.value === selectedProvider) ?? bookingProviders[0],
    [selectedProvider]
  );
  const selectedAddressDetails = useMemo(
    () => bookingAddresses.find((address) => address.value === selectedAddress) ?? null,
    [selectedAddress]
  );

  const bookingSummary = useMemo(() => {
    const servicePrice = selectedServiceDetails.serviceFee + selectedServiceDetails.materials + selectedServiceDetails.travel;
    const platformFee = 25;
    const totalPrice = servicePrice + platformFee;

    return {
      service: serviceTitle || selectedServiceDetails.label,
      serviceProvider: selectedProviderDetails.label,
      serviceAddress: selectedAddressDetails?.label || "Address not selected",
      bookingDate: bookingDate ? new Date(`${bookingDate}T12:00:00`).toLocaleDateString("en-LK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) : "Date not selected",
      selectedTimeSlot: selectedTime,
      specialInstructions: additionalDetails || "No special instructions provided.",
      servicePrice,
      platformFee,
      totalPrice,
    };
  }, [additionalDetails, bookingDate, selectedAddressDetails, selectedProviderDetails, selectedServiceDetails, selectedTime, serviceTitle]);

  const servicePricingRows = [
    { label: "Service fee", value: currencyFormatter.format(selectedServiceDetails.serviceFee) },
    { label: "Materials", value: currencyFormatter.format(selectedServiceDetails.materials) },
    { label: "Travel", value: currencyFormatter.format(selectedServiceDetails.travel) },
  ];

  const handleProceedToSummary = () => {
    setShowSummary(true);
  };

  const handleEditBooking = () => {
    setShowSummary(false);
  };

  const handleConfirmBooking = () => {
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <PageContainer className="booking-creation">
        <header className="booking-creation__header">
          <p className="booking-creation__eyebrow">Booking summary</p>
          <h1>Review your booking</h1>
          <p>Please confirm the details below before continuing.</p>
        </header>

        <div className="booking-creation__summary-page">
          <Card as="section" className="booking-creation__summary-panel" padding="lg">
            <div className="booking-creation__summary-list">
              <div className="booking-creation__summary-item">
                <span>Service</span>
                <strong>{bookingSummary.service}</strong>
              </div>
              <div className="booking-creation__summary-item">
                <span>Service Provider</span>
                <strong>{bookingSummary.serviceProvider}</strong>
              </div>
              <div className="booking-creation__summary-item">
                <span>Service Address</span>
                <strong>{bookingSummary.serviceAddress}</strong>
              </div>
              <div className="booking-creation__summary-item">
                <span>Booking Date</span>
                <strong>{bookingSummary.bookingDate}</strong>
              </div>
              <div className="booking-creation__summary-item">
                <span>Selected Time Slot</span>
                <strong>{bookingSummary.selectedTimeSlot}</strong>
              </div>
              <div className="booking-creation__summary-item booking-creation__summary-item--stacked">
                <span>Special Instructions</span>
                <strong>{bookingSummary.specialInstructions}</strong>
              </div>
            </div>

            <div className="booking-creation__price-panel">
              <h2>Price Details</h2>
              <div className="booking-creation__price-list" aria-label="Booking price details">
                <div className="booking-creation__price-row">
                  <span>Service price</span>
                  <strong>{currencyFormatter.format(bookingSummary.servicePrice)}</strong>
                </div>
                <div className="booking-creation__price-row">
                  <span>Platform/service fee</span>
                  <strong>{currencyFormatter.format(bookingSummary.platformFee)}</strong>
                </div>
                <div className="booking-creation__price-row booking-creation__price-row--total">
                  <span>Total estimated/current price</span>
                  <strong>{currencyFormatter.format(bookingSummary.totalPrice)}</strong>
                </div>
              </div>
              <p className="booking-creation__price-note">
                This is a temporary UI estimate only. The final booking price will be validated and stored by the backend when the booking is created.
              </p>
            </div>

            <div className="booking-creation__summary-actions">
              <Button type="button" variant="outline" size="lg" onClick={handleEditBooking}>
                Edit Booking
              </Button>
              <Button type="button" variant="primary" size="lg" onClick={handleConfirmBooking}>
                Confirm Booking
              </Button>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="booking-creation">
      <header className="booking-creation__header">
        <p className="booking-creation__eyebrow">New booking</p>
        <h1>Tell us what you need</h1>
        <p>Share a few details about the service you are looking for.</p>
      </header>

      <form className="booking-creation__form">
        <div className="booking-creation__content">
          <div className="booking-creation__main">
            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Service details</h2>
                <p>Choose the service that best matches your request.</p>
              </div>
              <div className="booking-creation__fields booking-creation__fields--two-column">
                <Select
                  label="Service"
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {bookingServices.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Service Provider"
                  value={selectedProvider}
                  onChange={(event) => setSelectedProvider(event.target.value)}
                >
                  <option value="" disabled>
                    Select a service provider
                  </option>
                  {bookingProviders.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Service title"
                  placeholder="What do you need help with?"
                  value={serviceTitle}
                  onChange={(event) => setServiceTitle(event.target.value)}
                />
              </div>
            </Card>

            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Location</h2>
                <p>Where should the service take place?</p>
              </div>
              <div className="booking-creation__fields">
                <Select
                  label="Service Address"
                  value={selectedAddress}
                  onChange={(event) => setSelectedAddress(event.target.value)}
                >
                  <option value="" disabled>
                    Select a service address
                  </option>
                  {bookingAddresses.map((address) => (
                    <option key={address.value} value={address.value}>
                      {address.label}
                    </option>
                  ))}
                </Select>
                <div className="booking-creation__fields booking-creation__fields--two-column">
                  <Input
                    label="City"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                  <Input
                    label="Postal code"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Booking date</h2>
                <p>Choose a date for your requested service.</p>
              </div>
              <Input
                label="Booking Date"
                type="date"
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
              />
            </Card>

            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Available Time</h2>
                <p>Choose an available time for your requested service.</p>
              </div>
              <div className="booking-creation__time-slots" role="group" aria-label="Available time slots">
                {bookingTimeSlots.map((slot) => {
                  const isUnavailable = slot.status === "unavailable";
                  const isSelected = selectedTime === slot.value;

                  return (
                    <Button
                      key={slot.value}
                      type="button"
                      variant="outline"
                      className={`booking-creation__time-slot ${isSelected ? "booking-creation__time-slot--selected" : ""} ${isUnavailable ? "booking-creation__time-slot--unavailable" : ""}`.trim()}
                      disabled={isUnavailable}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTime(slot.value)}
                    >
                      {slot.value}
                    </Button>
                  );
                })}
              </div>
            </Card>

            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Your details</h2>
                <p>Give providers the best way to reach you.</p>
              </div>
              <div className="booking-creation__fields booking-creation__fields--two-column">
                <Input
                  label="Full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
                <Input
                  label="Email address"
                  type="email"
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                />
                <Field label="Preferred contact method">
                  {({ id }) => (
                    <select
                      id={id}
                      className="cc-field-control"
                      value={preferredContactMethod}
                      onChange={(event) => setPreferredContactMethod(event.target.value)}
                    >
                      <option value="" disabled>
                        Select a contact method
                      </option>
                      {contactMethods.map((method) => (
                        <option key={method} value={method.toLowerCase()}>
                          {method}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </Card>

            <Card as="section" className="booking-creation__section">
              <div className="booking-creation__section-heading">
                <h2>Additional Details</h2>
                <p>Share any instructions that will help with the service.</p>
              </div>
              <Textarea
                label="Additional Details"
                placeholder="Add any additional instructions for the service provider..."
                value={additionalDetails}
                onChange={(event) => setAdditionalDetails(event.target.value)}
              />
            </Card>

            <div className="booking-creation__actions">
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
              <Button type="button" variant="primary" size="lg" onClick={handleProceedToSummary}>
                Proceed to Summary
              </Button>
            </div>
          </div>

          <aside className="booking-creation__summary">
            <Card as="aside" className="booking-creation__summary-card" variant="soft-green" padding="lg">
              <div className="booking-creation__summary-top">
                <p className="booking-creation__summary-label">Current estimate</p>
                {selectedProviderDetails.rating ? (
                  <span className="booking-creation__summary-rating">★ {selectedProviderDetails.rating.toFixed(1)}</span>
                ) : null}
              </div>

              <div className="booking-creation__summary-body">
                <h2>{selectedServiceDetails.label}</h2>

                <div className="booking-creation__provider-meta">
                  <span className="cc-avatar cc-avatar--sm">{selectedProviderDetails.initials}</span>
                  <div>
                    <p className="booking-creation__summary-subtitle">Service provider</p>
                    <strong>{selectedProviderDetails.label}</strong>
                  </div>
                </div>

                <div className="booking-creation__price-block">
                  <span className="booking-creation__summary-subtitle">Estimated/current price</span>
                  <strong>{currencyFormatter.format(selectedServiceDetails.estimatedTotal)}</strong>
                </div>

                <div className="booking-creation__price-list" aria-label="Service pricing information">
                  {servicePricingRows.map((row) => (
                    <div key={row.label} className="booking-creation__price-row">
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                  <div className="booking-creation__price-row booking-creation__price-row--total">
                    <span>Estimated total</span>
                    <strong>{currencyFormatter.format(selectedServiceDetails.estimatedTotal)}</strong>
                  </div>
                </div>

                <p className="booking-creation__price-note">
                  This is a temporary UI estimate only. The final booking price will be calculated and validated by the backend when the booking is created.
                </p>

                <Button type="button" variant="primary" size="lg" className="booking-creation__summary-action" onClick={handleProceedToSummary}>
                  Proceed to Summary
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </form>
    </PageContainer>
  );
}