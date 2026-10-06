import React from 'react';
import { useState } from "react";
import { Headphones, Search, ShieldCheck, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../common/PageContainer";
import { SERVICE_CATEGORIES } from "../../../config/serviceCategories";
import "./styles.css";

const trustItems = [
  { icon: Truck, label: "Trusted Providers" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Headphones, label: "24/7 Support" },
];

export default function CustomerTrustBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }
    if (category !== "all") {
      params.set("category", category);
    }

    const search = params.toString();
    navigate(search ? `/find-services?${search}` : "/find-services");
  };

  return (
    <PageContainer className="customer-trust-bar-wrap">
      <div className="customer-trust-bar">
        <form className="customer-trust-bar__search" role="search" onSubmit={handleSubmit}>
          <label className="cc-visually-hidden" htmlFor="customer-service-search">
            Search for services
          </label>
          <select
            aria-label="Service category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All Services</option>
            {SERVICE_CATEGORIES.map((serviceCategory) => (
              <option key={serviceCategory} value={serviceCategory}>
                {serviceCategory}
              </option>
            ))}
          </select>
          <input
            id="customer-service-search"
            type="search"
            placeholder="Search for services (e.g. cleaning, plumbing, repair...)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" aria-label="Search services">
            <Search size={22} />
          </button>
        </form>
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
