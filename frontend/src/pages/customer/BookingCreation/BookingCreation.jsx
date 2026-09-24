import React from "react";
import { useState } from "react";
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
  { value: "home-cleaning", label: "Home Cleaning" },
  { value: "plumbing-service", label: "Plumbing Service" },
  { value: "electrical-repair", label: "Electrical Repair" },
  { value: "ac-service", label: "AC Service" },
];
const bookingProviders = [
  { value: "abc-home-services", label: "ABC Home Services" },
  { value: "quickfix-services", label: "QuickFix Services" },
  { value: "citycare-services", label: "CityCare Services" },
];
const bookingAddresses = [
  { value: "home-123-main-street", label: "Home - 123 Main Street, Colombo" },
  { value: "office-45-galle-road", label: "Office - 45 Galle Road, Colombo" },
];
const contactMethods = ["Phone", "Email"];

export default function BookingCreation() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
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

  return (
    <PageContainer className="booking-creation">
      <header className="booking-creation__header">
        <p className="booking-creation__eyebrow">New booking</p>
        <h1>Tell us what you need</h1>
        <p>
          Share a few details about the service you are looking for.
        </p>
      </header>

      <form className="booking-creation__form">
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
          <Button type="button" variant="primary" size="lg">
            Review Booking
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}