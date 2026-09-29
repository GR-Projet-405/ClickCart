import { API_BASE_URL } from "../config/api";

const MOCK_BOOKINGS = [
  {
    id: "bk-101",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-1",
    serviceTitle: "AC Repair & Service",
    serviceCategory: "Appliance Repair",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-1",
    providerName: "Kamal Perera",
    providerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.9,
    providerReviewCount: 120,
    bookingDate: "16 Sep 2026",
    timeSlot: "10:00 AM - 11:30 AM",
    location: "Colombo",
    address: "No. 45, Galle Road, Colombo 03",
    totalCost: 3000,
    currency: "LKR",
    status: "UPCOMING",
    statusLabel: "Confirmed",
    notes: "Regular maintenance, filter cleaning, and gas pressure check.",
    createdAt: "2026-09-10T09:00:00Z",
    updatedAt: "2026-09-10T09:00:00Z",
  },
  {
    id: "bk-102",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-2",
    serviceTitle: "House Cleaning",
    serviceCategory: "Cleaning",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-2",
    providerName: "Nisansala Silva",
    providerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.8,
    providerReviewCount: 95,
    bookingDate: "20 Sep 2026",
    timeSlot: "2:00 PM - 4:00 PM",
    location: "Colombo",
    address: "No. 45, Galle Road, Colombo 03",
    totalCost: 2500,
    currency: "LKR",
    status: "UPCOMING",
    statusLabel: "Confirmed",
    notes: "Deep cleaning for living room, kitchen, and balcony.",
    createdAt: "2026-09-12T14:30:00Z",
    updatedAt: "2026-09-12T14:30:00Z",
  },
  {
    id: "bk-103",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-3",
    serviceTitle: "Plumbing & Pipe Leak Repair",
    serviceCategory: "Plumbing",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-3",
    providerName: "Ruwan Jayasinghe",
    providerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.7,
    providerReviewCount: 84,
    bookingDate: "25 Sep 2026",
    timeSlot: "11:00 AM - 1:00 PM",
    location: "Kandy",
    address: "No. 12, Peradeniya Road, Kandy",
    totalCost: 4200,
    currency: "LKR",
    status: "ACTIVE",
    statusLabel: "In Progress",
    notes: "Fixing bathroom tap leakage and main supply pipe inspection.",
    createdAt: "2026-09-15T08:15:00Z",
    updatedAt: "2026-09-15T08:15:00Z",
  },
  {
    id: "bk-104",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-4",
    serviceTitle: "Sofa & Carpet Deep Cleaning",
    serviceCategory: "Cleaning",
    imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-4",
    providerName: "Nimali Fernando",
    providerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.9,
    providerReviewCount: 150,
    bookingDate: "10 Aug 2026",
    timeSlot: "9:00 AM - 12:00 PM",
    location: "Colombo",
    address: "No. 45, Galle Road, Colombo 03",
    totalCost: 5500,
    currency: "LKR",
    status: "COMPLETED",
    statusLabel: "Completed",
    notes: "Steam extraction cleaning for 5-seater sofa set.",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-10T12:00:00Z",
  },
  {
    id: "bk-105",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-5",
    serviceTitle: "Electrical Wiring & Socket Repair",
    serviceCategory: "Electrical",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-5",
    providerName: "Sunil Shantha",
    providerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.8,
    providerReviewCount: 62,
    bookingDate: "02 Jul 2026",
    timeSlot: "3:00 PM - 5:00 PM",
    location: "Galle",
    address: "No. 8, Beach Road, Galle",
    totalCost: 3500,
    currency: "LKR",
    status: "COMPLETED",
    statusLabel: "Completed",
    notes: "Repaired main trip switch and replaced broken wall sockets.",
    createdAt: "2026-06-25T11:20:00Z",
    updatedAt: "2026-07-02T17:00:00Z",
  },
  {
    id: "bk-106",
    customerId: "cust_101",
    customerName: "Tharindu",
    customerEmail: "tharindu@example.com",
    customerPhone: "+94 77 123 4567",
    serviceId: "srv-6",
    serviceTitle: "Lawn Mowing & Garden Care",
    serviceCategory: "Gardening",
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb1b7a5?q=80&w=600&auto=format&fit=crop",
    providerId: "prv-6",
    providerName: "Kasun Wickramasinghe",
    providerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    providerRating: 4.6,
    providerReviewCount: 41,
    bookingDate: "15 May 2026",
    timeSlot: "8:00 AM - 10:00 AM",
    location: "Negombo",
    address: "No. 3, Main Street, Negombo",
    totalCost: 2800,
    currency: "LKR",
    status: "CANCELLED",
    statusLabel: "Cancelled",
    notes: "Cancelled due to heavy rainfall.",
    createdAt: "2026-05-10T16:00:00Z",
    updatedAt: "2026-05-14T09:30:00Z",
  },
];

let localBookings = [...MOCK_BOOKINGS];

export async function fetchCustomerBookings(customerId = "cust_101", tab = "upcoming") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/customer/${customerId}?tab=${tab}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend API not reachable, falling back to local dataset:", err.message);
  }

  // Fallback to local data
  return localBookings.filter((b) => {
    if (tab === "upcoming") return b.status === "UPCOMING" || b.status === "CONFIRMED";
    if (tab === "active") return b.status === "ACTIVE" || b.status === "IN_PROGRESS";
    if (tab === "history") return b.status === "COMPLETED" || b.status === "CANCELLED";
    return true;
  });
}

export async function fetchCustomerBookingSummary(customerId = "cust_101") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/customer/${customerId}/summary`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend API not reachable, using calculated summary:", err.message);
  }

  const upcomingCount = localBookings.filter(
    (b) => b.status === "UPCOMING" || b.status === "CONFIRMED"
  ).length;
  const activeCount = localBookings.filter(
    (b) => b.status === "ACTIVE" || b.status === "IN_PROGRESS"
  ).length;
  const historyCount = localBookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  ).length;

  return {
    upcomingCount,
    activeCount,
    historyCount,
    totalCount: localBookings.length,
  };
}

export async function cancelBooking(bookingId, reason = "") {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend API cancel failed, updating locally:", err.message);
  }

  localBookings = localBookings.map((b) => {
    if (b.id === bookingId) {
      return {
        ...b,
        status: "CANCELLED",
        statusLabel: "Cancelled",
        notes: reason ? `${b.notes ? b.notes + " | " : ""}Cancellation reason: ${reason}` : b.notes,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  return localBookings.find((b) => b.id === bookingId);
}
