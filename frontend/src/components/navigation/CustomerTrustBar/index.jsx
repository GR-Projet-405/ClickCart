import React from 'react';
import { Headphones, Search, ShieldCheck, Truck } from "lucide-react";
import PageContainer from "../../common/PageContainer";
import "./styles.css";

const trustItems = [
  { icon: Truck, label: "Trusted Providers" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Headphones, label: "24/7 Support" },
];

export default function CustomerTrustBar() {
  return (
    <PageContainer className="customer-trust-bar-wrap">
      <div className="customer-trust-bar">
        <div className="customer-trust-bar__search" role="search">
          <label className="cc-visually-hidden" htmlFor="customer-service-search">
            Search for services
          </label>
          <select aria-label="Service category" defaultValue="all">
            <option value="all">All Services</option>
          </select>
          <input
            id="customer-service-search"
            type="search"
            placeholder="Search for services (e.g. cleaning, plumbing, repair...)"
          />
          <button type="button" aria-label="Search services">
            <Search size={22} />
          </button>
        </div>
        <div className="customer-trust-bar__items">
          {trustItems.map(({ icon: Icon, label }) => (
            <div className="customer-trust-bar__item" key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
