import { API_BASE_URL } from "../config/api";

const demoProvider = {
  slug: "cleanpro-services",
  name: "CleanPro Services",
  tagline: "Home Cleaning Specialists",
  description: "CleanPro Services provides reliable, high-quality cleaning services in Colombo and nearby areas. Our friendly team takes care of dusting, vacuuming, mopping, kitchens and bathrooms, leaving every space clean and comfortable.",
  imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=240&q=85",
  rating: 4.8,
  reviewCount: 124,
  location: "Colombo, Sri Lanka",
  serviceAreas: ["Colombo", "Dehiwala", "Rajagiriya"],
  workingHours: [
    { day: "Monday-Friday", hours: "8:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  services: [
    { slug: "house-cleaning", title: "House cleaning", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=85", startingPrice: "LKR 3,500" },
    { slug: "office-cleaning", title: "Office cleaning", imageUrl: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=600&q=85", startingPrice: "LKR 8,000" },
    { slug: "deep-cleaning", title: "Deep cleaning", imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=85", startingPrice: "LKR 6,000" },
  ],
  portfolioImages: [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=85",
  ],
  highlights: ["Trusted Professionals", "Wide Range of Services", "Affordable Pricing", "24/7 Customer Support"],
};

const demoService = {
  slug: "house-cleaning",
  title: "Professional House Cleaning",
  providerSlug: "cleanpro-services",
  providerName: "CleanPro Services",
  description: "Enjoy a clean, fresh home with our professional cleaning service. Our team handles dusting, vacuuming, mopping and kitchen cleaning.",
  location: "Colombo, Sri Lanka",
  price: "LKR 3,500",
  rating: 4.8,
  reviewCount: 124,
  gallery: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=85",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=85",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=85",
  ],
  packages: [
    { name: "Basic", price: "LKR 3,500", duration: "2 hours", features: ["General cleaning", "Dusting and vacuuming", "Trash removal"] },
    { name: "Standard", price: "LKR 6,000", duration: "4 hours", features: ["Everything in Basic", "Kitchen cleaning", "Bathroom cleaning"] },
    { name: "Premium", price: "LKR 9,000", duration: "6 hours", features: ["Everything in Standard", "Detailed cleaning", "Interior windows"] },
  ],
  availability: [
    { day: "Mon", date: "Apr 21", times: ["09:00 AM", "10:30 AM", "02:00 PM"] },
    { day: "Tue", date: "Apr 22", times: ["09:00 AM", "02:00 PM"] },
    { day: "Wed", date: "Apr 23", times: ["10:30 AM", "02:00 PM"] },
    { day: "Thu", date: "Apr 24", times: ["09:00 AM", "10:30 AM"] },
    { day: "Fri", date: "Apr 25", times: ["09:00 AM", "02:00 PM"] },
  ],
  serviceAreas: ["Colombo", "Dehiwala", "Kandy"],
};

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function getProvider(slug = "cleanpro-services") {
  return request(`/providers/${slug}`).catch(() => demoProvider);
}

export function getService(slug = "house-cleaning") {
  return request(`/services/${slug}`).catch(() => demoService);
}
