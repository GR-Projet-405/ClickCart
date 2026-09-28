# DEV-15: Provider Matching & Recommendations

1. Module Overview

DEV-15 implements the **Provider Matching & Recommendations** module for ClickCart. The module helps users discover suitable local service providers based on service category, location, distance, provider match score, ratings, pricing, availability information, and verification status.

The module provides a recommendation feed with provider cards, category filtering, search, sorting, provider profile viewing, match explanation, and booking actions.

The system also includes fallback mechanisms to ensure recommendations can still be displayed when the backend returns no matching providers or when an API/database error occurs.

---

2. Frontend Responsibilities — React.js

2.1 Recommendation Page

`RecommendationsPage.jsx` is the main container for the DEV-15 recommendation interface.

It manages:

- Provider recommendation data
- Search queries
- Service category filtering
- Sorting
- Loading state
- Provider profile view
- Match breakdown modal
- Booking/instant dispatch modal

The available sorting options are:

- Match Score
- Rating
- Distance
- Lowest Price

  2.2 Provider Recommendation Cards

`RecommendedProviderCard.jsx` displays provider information including:

- Provider/business name
- Service category
- Rating
- Review count
- Distance
- Starting price
- Match score
- Verification status
- Match/recommendation explanation
- Provider image

  2.3 Recommendation Filters

`RecommendationFilters.jsx` provides category and sorting controls.

The current test categories include:

- All
- AC Repair
- Plumbing
- Electrical

  2.4 Match Breakdown

`MatchBreakdownModal.jsx` provides additional information about why a provider is recommended.

It supports the transparency requirement of DEV-15 by displaying matching information instead of presenting recommendations without explanation.

2.5 Provider Profile

`ProviderProfileView.jsx` allows users to open a detailed provider profile from a recommendation card.

The selected provider information is passed to the profile view, including:

- Provider name
- Service
- Distance
- Provider information available from the recommendation result

  2.6 Booking / Instant Dispatch

`InstantDispatchModal.jsx` provides the booking interaction from a recommended provider and supports the available booking flow.

---

3. Backend Responsibilities — Spring Boot

3.1 Provider Matching API

The main DEV-15 recommendation endpoint is:

```text
GET /api/v1/recommendations/match
```

### Request parameters

```text
service
location
maxDistance
```

### Example

```text
GET /api/v1/recommendations/match?service=Plumbing&location=Panadura%20Town&maxDistance=10
```

The endpoint:

1. Receives the requested service category.
2. Receives the requested location.
3. Receives the maximum search distance.
4. Searches for matching providers.
5. Filters providers by service category and maximum distance.
6. Sorts the matching providers according to their match score.
7. Returns the recommendation results.

### Response structure

```json
{
  "status": "SUCCESS",
  "totalMatches": 1,
  "data": [
    {
      "id": "PROV-FALLBACK-1",
      "businessName": "Panadura Verified Pro (Offline Mode)",
      "serviceCategory": "Plumbing",
      "location": "Panadura Town",
      "rating": 4.8,
      "reviewCount": 120,
      "distanceKm": 1.2,
      "startingPrice": 2500.0,
      "matchScore": 95,
      "verified": true
    }
  ]
}
```

## 3.2 Provider Details API

The module also provides:

```text
GET /api/v1/recommendations/provider/{providerId}
```

This endpoint retrieves the details of a selected provider.

---

4. Ranking Rules

The current DEV-15 implementation uses a simple and transparent ranking process.

### Current ranking flow

```text
Requested service
        ↓
Service category filtering
        ↓
Maximum distance filtering
        ↓
Provider match score
        ↓
Sort by match score
        ↓
Recommended providers
```

The backend searches for providers matching the requested service category and maximum distance.

Providers are then sorted using their existing `matchScore`, with higher scores appearing first.

The current implementation does **not** calculate a new weighted score using a formula such as 30% service fit, 25% proximity, 20% availability, 15% price, and 10% reputation.

### Provider information available for recommendations

Provider records can contain:

- Service category
- Location
- Distance
- Rating
- Review count
- Starting price
- Match score
- Verification status
- Availability information

The frontend additionally supports sorting providers by:

- Match score
- Rating
- Distance
- Lowest price

This provides users with different ways to inspect the recommendation results.

---

5. Business Rules

The recommendation system is designed to prioritize suitable and verified providers.

The backend fallback process attempts to retrieve verified providers when normal matching does not return results.

The recommendation flow does not use sponsored placement as a ranking input in the current implementation.

The system also avoids displaying an empty recommendation page when recommendation data is unavailable by using fallback data.

> **Note:** Advanced validation such as national identity verification, municipal registration validation, reference checks, listing-status validation, and marketplace-rule enforcement are outside the currently implemented DEV-15 recommendation logic unless provided by other ClickCart modules.

---

6. API and Frontend Dependencies

6.1 Frontend Dependencies

The DEV-15 frontend uses:

- React
- Vite
- JavaScript
- Axios
- React Router
- Lucide React

The recommendation API communication is handled by:

```text
src/services/recommendationService.js
```

Axios is used to send requests from the React frontend to the Spring Boot backend.

6.2 Backend Dependencies

The backend uses:

- Spring Boot
- Java 17
- Maven
- Spring Data MongoDB
- MongoDB Atlas

Main backend components

```text
ProviderRecommendationController
RecommendationEngineService
ProviderRepository
ProviderProfile
```

---

7. Test Data

The following providers are used as test data for the DEV-15 recommendation interface.

## Provider 1 — AC Repair

```text
ID: PROV-100
Business Name: ABC AC Solutions
Service Category: AC Repair
Rating: 4.8
Review Count: 126
Distance: 2.4 km
Starting Price: 2500
Match Score: 98
Availability: Available Tomorrow
Verified: Yes
```

## Provider 2 — Plumbing

```text
ID: PROV-200
Business Name: Panadura Pro Plumbing
Service Category: Plumbing
Rating: 4.9
Review Count: 184
Distance: 0.8 km
Starting Price: 2000
Match Score: 99
Availability: Available Today / Tomorrow
Verified: Yes
```

## Provider 3 — Electrical

```text
ID: PROV-300
Business Name: Lanka Electrical Hub
Service Category: Electrical
Rating: 4.7
Review Count: 92
Distance: 3.1 km
Starting Price: 3000
Match Score: 91
Availability: Available Today
Verified: Yes
```

These providers are used to test:

- Provider recommendation cards
- Category filtering
- Search
- Match-score sorting
- Rating sorting
- Distance sorting
- Price sorting
- Provider profile
- Match breakdown
- Booking interaction

---

8. Fallback Behavior

DEV-15 implements fallback handling at both backend and frontend levels.

8.1 Backend Fallback

When the recommendation query does not return matching providers, the backend attempts to retrieve verified providers.

If the database operation fails, the recommendation service returns an in-memory fallback provider.

### Backend fallback provider

```text
Business Name:
Panadura Verified Pro (Offline Mode)

Service:
Requested service category

Location:
Panadura Town

Rating:
4.8

Review Count:
120

Distance:
1.2 km

Starting Price:
2500

Match Score:
95

Verified:
Yes
```

This allows the API to provide a usable response even when the normal provider query cannot produce results.

8.2 Frontend Fallback

The React frontend also contains local fallback recommendation data.

If the API returns no usable recommendation data or encounters an error, the frontend can display the predefined recommendation providers.

This prevents the recommendation interface from becoming blank when the backend is temporarily unavailable.

---

# 9. Error Handling

The frontend recommendation service handles API errors using Axios error handling.

When an API request fails, the service returns an error response structure:

```json
{
  "status": "ERROR",
  "totalMatches": 0,
  "data": []
}
```

The recommendation page can then use the local fallback recommendation data.

The backend recommendation controller also handles exceptions and returns fallback provider information when the recommendation process encounters an error.

---

10. Future Enhancement — Advanced Recommendation Intelligence

The current DEV-15 implementation provides rule-based provider matching and ranking.

The recommendation engine can be extended in the future with:

- Weighted ranking based on multiple factors
- Semantic matching for natural-language service requests
- More advanced location calculations
- Availability-aware ranking
- Price preference matching
- Personalized recommendations based on user history
- AI/vector-based similarity matching

These are considered **future enhancements** and are not claimed as part of the current DEV-15 implementation.

---

#11. DEV-15 Handover Summary

| Handover Item        | Implementation                  |
| -------------------- | ------------------------------- |
| Provider matching    | Service category + distance     |
| Ranking              | Stored match score              |
| Search               | Provider/service search         |
| Category filtering   | Implemented                     |
| Sorting              | Match, rating, distance, price  |
| Recommendation API   | Implemented                     |
| Provider details API | Implemented                     |
| Provider cards       | Implemented                     |
| Match breakdown      | Implemented                     |
| Provider profile     | Implemented                     |
| Booking interaction  | Implemented                     |
| Backend fallback     | Implemented                     |
| Frontend fallback    | Implemented                     |
| Test data            | AC Repair, Plumbing, Electrical |
| MongoDB integration  | Implemented                     |
| Advanced AI ranking  | Future enhancement              |

### Final Handover Statement

_DEV-15 Provider Matching & Recommendations provides a functional recommendation workflow from provider matching and ranking through frontend presentation, filtering, provider inspection, and booking. The implementation uses service category and distance filtering with match-score-based ranking, supported by frontend sorting and transparent fallback mechanisms. The architecture can be extended later with more advanced weighted, semantic, or AI-based recommendation logic without replacing the existing fallback workflow._

For the DEV-15 handover

- Add a claim-by-claim correction table
- Create the PDF-ready version
