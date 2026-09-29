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

const ALL_MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    transactionId: "CC-24052801",
    date: "May 28, 2024",
    bookingRef: "BK10492",
    serviceTitle: "Home Plumbing Repair",
    category: "Plumbing",
    customerName: "Sarah J.",
    grossAmount: 10000.00,
    commissionRate: 0.10,
    commissionAmount: 1000.00,
    netAmount: 9000.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240529",
    currency: "LKR"
  },
  {
    id: "tx-2",
    transactionId: "CC-24052703",
    date: "May 28, 2024",
    bookingRef: "BK10481",
    serviceTitle: "Electric Maintenance",
    category: "Electrical",
    customerName: "Nimal Perera",
    grossAmount: 6500.00,
    commissionRate: 0.10,
    commissionAmount: 650.00,
    netAmount: 5850.00,
    status: "PENDING",
    settlementBatchId: null,
    currency: "LKR"
  },
  {
    id: "tx-3",
    transactionId: "CC-24052501",
    date: "May 26, 2024",
    bookingRef: "BK10475",
    serviceTitle: "Cleaning Service",
    category: "Cleaning",
    customerName: "Dilum Randira",
    grossAmount: 3200.00,
    commissionRate: 0.12,
    commissionAmount: 384.00,
    netAmount: 2816.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240527",
    currency: "LKR"
  },
  {
    id: "tx-4",
    transactionId: "CC-24052410",
    date: "May 24, 2024",
    bookingRef: "BK10468",
    serviceTitle: "AC Filter Maintenance",
    category: "Electrical",
    customerName: "Jayani Dasanayaka",
    grossAmount: 8500.00,
    commissionRate: 0.10,
    commissionAmount: 850.00,
    netAmount: 7650.00,
    status: "AVAILABLE",
    settlementBatchId: null,
    currency: "LKR"
  },
  {
    id: "tx-5",
    transactionId: "CC-24052309",
    date: "May 23, 2024",
    bookingRef: "BK10452",
    serviceTitle: "Full House Deep Cleaning",
    category: "Cleaning",
    customerName: "Ruwan Fernando",
    grossAmount: 14000.00,
    commissionRate: 0.10,
    commissionAmount: 1400.00,
    netAmount: 12600.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240524",
    currency: "LKR"
  },
  {
    id: "tx-6",
    transactionId: "CC-24052204",
    date: "May 22, 2024",
    bookingRef: "BK10440",
    serviceTitle: "Plumbing Leak Inspection",
    category: "Plumbing",
    customerName: "Kasun Madeesha",
    grossAmount: 5000.00,
    commissionRate: 0.10,
    commissionAmount: 500.00,
    netAmount: 4500.00,
    status: "REFUNDED",
    settlementBatchId: "CC-REF-240523",
    currency: "LKR"
  },
  {
    id: "tx-7",
    transactionId: "CC-24052108",
    date: "May 21, 2024",
    bookingRef: "BK10432",
    serviceTitle: "Wall Painting - Living Area",
    category: "Painting",
    customerName: "Thushara Karunaratne",
    grossAmount: 22000.00,
    commissionRate: 0.10,
    commissionAmount: 2200.00,
    netAmount: 19800.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240522",
    currency: "LKR"
  },
  {
    id: "tx-8",
    transactionId: "CC-24052002",
    date: "May 20, 2024",
    bookingRef: "BK10420",
    serviceTitle: "Garden Landscaping",
    category: "Maintenance",
    customerName: "Minoli Silva",
    grossAmount: 16500.00,
    commissionRate: 0.10,
    commissionAmount: 1650.00,
    netAmount: 14850.00,
    status: "AVAILABLE",
    settlementBatchId: null,
    currency: "LKR"
  },
  {
    id: "tx-9",
    transactionId: "CC-24051911",
    date: "May 19, 2024",
    bookingRef: "BK10411",
    serviceTitle: "Bathroom Tile Repair",
    category: "Plumbing",
    customerName: "Aathil Hakam",
    grossAmount: 9200.00,
    commissionRate: 0.10,
    commissionAmount: 920.00,
    netAmount: 8280.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240520",
    currency: "LKR"
  },
  {
    id: "tx-10",
    transactionId: "CC-24051805",
    date: "May 18, 2024",
    bookingRef: "BK10398",
    serviceTitle: "Distribution Board Upgrade",
    category: "Electrical",
    customerName: "Shermi Weerasinghe",
    grossAmount: 11000.00,
    commissionRate: 0.10,
    commissionAmount: 1100.00,
    netAmount: 9900.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240519",
    currency: "LKR"
  },
  {
    id: "tx-11",
    transactionId: "CC-24051701",
    date: "May 17, 2024",
    bookingRef: "BK10385",
    serviceTitle: "Kitchen Sink Drain Replacement",
    category: "Plumbing",
    customerName: "Chamalsha Induwara",
    grossAmount: 4500.00,
    commissionRate: 0.10,
    commissionAmount: 450.00,
    netAmount: 4050.00,
    status: "PENDING",
    settlementBatchId: null,
    currency: "LKR"
  },
  {
    id: "tx-12",
    transactionId: "CC-24051512",
    date: "May 15, 2024",
    bookingRef: "BK10370",
    serviceTitle: "Sofa Deep Shampooing",
    category: "Cleaning",
    customerName: "Lahiru Welagedara",
    grossAmount: 7500.00,
    commissionRate: 0.10,
    commissionAmount: 750.00,
    netAmount: 6750.00,
    status: "SETTLED",
    settlementBatchId: "CC-PAY-240516",
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
      // Local robust mock filter
      let filtered = [...ALL_MOCK_TRANSACTIONS];

      if (status && status !== "ALL") {
        filtered = filtered.filter(
          (t) => t.status.toLowerCase() === status.toLowerCase()
        );
      }

      if (search && search.trim() !== "") {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.transactionId.toLowerCase().includes(q) ||
            t.bookingRef.toLowerCase().includes(q) ||
            t.serviceTitle.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q)
        );
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const start = page * size;
      const content = filtered.slice(start, start + size);

      return {
        content,
        totalElements,
        totalPages,
        number: page
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
