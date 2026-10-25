# Feature Specification & Handover: DEV-28 Provider Earnings

- **Developer**: Pasan Kalhara (Permanent)
- **DEV ID**: DEV-28
- **User Group**: Service Provider
- **Domain**: G. Marketplace Finance
- **Assigned Feature**: Provider Earnings
- **Scope**: Earnings Dashboard & Transaction History

---

## 1. Feature Overview

The **Provider Earnings** module provides Service Providers with full visibility into their marketplace finances:
1. **Earnings Dashboard**:
   - Total Gross Revenue, Commission Deductions, Net Available Balance (with payout request CTA), and Pending Escrow Clearance.
   - Monthly revenue vs. commission trend area chart.
   - Revenue distribution by service category donut chart.
   - Recent completed jobs table.
   - Interactive Export Report and Request Payout modals.
2. **Transaction History**:
   - Filterable, searchable, and paginated transaction audit trail.
   - Status filters: `SETTLED`, `AVAILABLE`, `PENDING`, `REFUNDED`.
   - CSV export statement generator.
   - Slide-over drawer with itemized receipt breakdown and BR-07 snapshot verification.

---

## 2. Business Rules Implemented

- **BR-07 (Commission Snapshot)**: The commission percentage and exact fee deducted are computed and saved at the time of transaction creation. Past earnings are never altered if platform commission policies change in the future.
- **BR-09 (Data Isolation & Security)**: Provider financial records are isolated by `providerId`. Cross-provider queries are strictly rejected with `400 / 403`.
- **BR-10 (Auditability)**: All payout requests and transaction status transitions maintain historical traceability and settlement batch references.

---

## 3. REST API Contracts

Base path: `/api/provider/earnings`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/provider/earnings/summary?providerId={id}` | Returns 4 summary KPI card metrics and period comparisons |
| `GET` | `/api/provider/earnings/trends?providerId={id}` | Returns 6-month time-series earnings vs. commission |
| `GET` | `/api/provider/earnings/categories?providerId={id}` | Returns category breakdown for the donut chart |
| `GET` | `/api/provider/earnings/transactions?providerId={id}&search={s}&status={st}&page=0&size=10` | Filterable, paginated transaction history |
| `GET` | `/api/provider/earnings/transactions/{txnId}` | Returns single transaction breakdown |
| `POST` | `/api/provider/earnings/payout?providerId={id}` | Validates available balance and initiates withdrawal request |
| `POST` | `/api/provider/earnings/record` | Inter-feature hook when a booking is completed |

---

## 4. MongoDB Schema (`provider_earnings`)

```json
{
  "_id": "ObjectId",
  "providerId": "String (indexed)",
  "bookingId": "String (indexed)",
  "transactionId": "String (unique, indexed)",
  "serviceTitle": "String",
  "category": "String",
  "customerName": "String",
  "grossAmount": "Decimal128",
  "commissionRate": "Decimal128 (snapshot)",
  "commissionAmount": "Decimal128 (snapshot)",
  "netAmount": "Decimal128",
  "currency": "LKR",
  "status": "AVAILABLE | SETTLED | PENDING | REFUNDED",
  "settlementBatchId": "String (optional)",
  "serviceCompletedAt": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

## 5. Frontend Routes

- `/provider/earnings` — Earnings Dashboard Page
- `/provider/earnings/transactions` — Transaction History Page
