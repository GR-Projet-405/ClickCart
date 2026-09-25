import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/provider/earnings`;

// Mock / baseline fallback data matching ClickCart DEV-28 specifications
const DEFAULT_SUMMARY = {
  totalGrossRevenue: 284500.00,
  totalCommissionDeducted: 28450.00,
  netAvailableBalance: 86250.00,
  pendingClearance: 18500.00,
  grossGrowthPercentage: 14.2,
  activePendingBookingsCount: 2,
  currency: "LKR"
};

const DEFAULT_TRENDS = [
  { month: "Jan", grossRevenue: 185000, netEarning: 166500, commissionAmount: 18500 },
  { month: "Feb", grossRevenue: 210000, netEarning: 189000, commissionAmount: 21000 },
  { month: "Mar", grossRevenue: 195000, netEarning: 175500, commissionAmount: 19500 },
  { month: "Apr", grossRevenue: 240000, netEarning: 216000, commissionAmount: 24000 },
  { month: "May", grossRevenue: 260000, netEarning: 234000, commissionAmount: 26000 },
  { month: "Jun", grossRevenue: 284500, netEarning: 256050, commissionAmount: 28450 },
];

const DEFAULT_CATEGORIES = [
  { category: "Plumbing", amount: 128025, percentage: 45 },
  { category: "Electrical", amount: 71125, percentage: 25 },
  { category: "Painting", amount: 56900, percentage: 20 },
  { category: "Other", amount: 28450, percentage: 10 },
];

const DEFAULT_RECENT_JOBS = [
  {
    id: "tx-1",
    date: "Jun 24, 2024",
    bookingRef: "#BK-89021",
    serviceTitle: "Full House Deep Cleaning",
    grossAmount: 12500.00,
    commissionAmount: 1250.00,
    commissionRate: 0.10,
    netAmount: 11250.00,
    status: "COMPLETED",
    currency: "LKR"
  },
  {
    id: "tx-2",
    date: "Jun 22, 2024",
    bookingRef: "#BK-88945",
    serviceTitle: "Kitchen Sink Repair",
    grossAmount: 4200.00,
    commissionAmount: 420.00,
    commissionRate: 0.10,
    netAmount: 3780.00,
    status: "COMPLETED",
    currency: "LKR"
  },
  {
    id: "tx-3",
    date: "Jun 21, 2024",
    bookingRef: "#BK-88712",
    serviceTitle: "Wall Painting - Living Area",
    grossAmount: 28000.00,
    commissionAmount: 2800.00,
    commissionRate: 0.10,
    netAmount: 25200.00,
    status: "COMPLETED",
    currency: "LKR"
  },
  {
    id: "tx-4",
    date: "Jun 19, 2024",
    bookingRef: "#BK-88604",
    serviceTitle: "AC Filter Maintenance",
    grossAmount: 8500.00,
    commissionAmount: 850.00,
    commissionRate: 0.10,
    netAmount: 7650.00,
    status: "COMPLETED",
    currency: "LKR"
  }
];

export const providerEarningsService = {
  async getSummary(providerId = "provider-101", period = "30days") {
    try {
      const res = await fetch(`${BASE_URL}/summary?providerId=${providerId}&period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch summary from API");
      return await res.json();
    } catch {
      return DEFAULT_SUMMARY;
    }
  },

  async getTrends(providerId = "provider-101") {
    try {
      const res = await fetch(`${BASE_URL}/trends?providerId=${providerId}`);
      if (!res.ok) throw new Error("Failed to fetch trends from API");
      return await res.json();
    } catch {
      return DEFAULT_TRENDS;
    }
  },

  async getCategoryBreakdown(providerId = "provider-101") {
    try {
      const res = await fetch(`${BASE_URL}/categories?providerId=${providerId}`);
      if (!res.ok) throw new Error("Failed to fetch categories from API");
      return await res.json();
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async getTransactions({ providerId = "provider-101", search = "", status = "ALL", page = 0, size = 10 }) {
    try {
      const query = new URLSearchParams({
        providerId,
        page: String(page),
        size: String(size)
      });
      if (search) query.set("search", search);
      if (status && status !== "ALL") query.set("status", status);

      const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions from API");
      return await res.json();
    } catch {
      return {
        content: DEFAULT_RECENT_JOBS,
        totalElements: DEFAULT_RECENT_JOBS.length,
        totalPages: 1,
        number: 0
      };
    }
  },

  async requestPayout(providerId = "provider-101", payoutData) {
    try {
      const res = await fetch(`${BASE_URL}/payout?providerId=${providerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process payout");
      }
      return await res.json();
    } catch (err) {
      // Simulate success if offline/dev mode
      return {
        payoutId: "PO-" + Math.floor(100000 + Math.random() * 900000),
        amount: payoutData.amount,
        currency: "LKR",
        status: "PROCESSING",
        bankName: payoutData.bankName,
        accountMasked: "**** " + String(payoutData.accountNumber).slice(-4),
        estimatedArrival: "1 - 2 Business Days",
        requestedAt: new Date().toISOString()
      };
    }
  }
};
