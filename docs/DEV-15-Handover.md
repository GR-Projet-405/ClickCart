# DEV-15: Provider Matching & Recommendations

1. Module Overview
   DEV-15 delivers a transparent, proximity-driven, and merit-based recommendation engine for ClickCart. It replaces traditional black-box directories with a structured matching algorithm that ranks local professionals based on verified credentials, real-time availability, geographical proximity, and customer feedback.

2. Frontend Responsibilities (React.js)
   **Component Architecture & UI Flows:**
   Developed `RecommendationsPage.jsx` as the primary container managing state for search queries, category filters (`All`, `AC Repair`, `Plumbing`, `Electrical`), and sorting criteria (`match`, `rating`, `distance`, `price-low`).
   Built interactive cards (`RecommendedProviderCard.jsx`) featuring verified status badges, match percentage tags, and dynamic distance indicators.

**Modals & Views Integration:**
_Match Breakdown Modal:_ Displays the 3-pillar matching methodology and zero black-box logic explanation.
_Instant Dispatch Modal:_ Streamlines the booking process for same-day/next-day time slots.
_Provider Profile View Mode:_ Implements dynamic toggling to inspect deep provider profiles, service lists, and service territory maps without losing feed state.

**Resilience & Fallback Handling:**
Engineered a robust asynchronous loader paired with a timeout safeguard. If backend latency exceeds thresholds or the server is offline, local fallback mock recommendations render instantly to prevent blank UI screens.

3. Backend Responsibilities & Ranking Rules (Spring Boot)
   **API Endpoints:**
   `GET /api/v1/recommendations/curated`: Fetches personalized matches based on user context and location.
   `GET /api/v1/recommendations/search-matches`: Handles filtered queries with multi-criteria explainability payloads.
   **Ranking Algorithm & Composite Score (S):**
   The ranking engine calculates a weighted match percentage score ranging from 0 to 100 using the following formula:
   $$S = (0.30 \times S_{\text{fit}}) + (0.25 \times S_{\text{prox}}) + (0.20 \times S_{\text{avail}}) + (0.15 \times S_{\text{price}}) + (0.10 \times S_{\text{rep}})$$
   _Requirement Fit (30%):_ Semantic and category tag matching.
   _Proximity Advantage (25%):_ Geographic distance calculation in kilometers from the provider base to the customer location.
   _Immediate Availability (20%):_ Real-time synchronization with provider dispatch calendars.
   _Transparent Pricing (15%):_ Alignment with customer budget brackets.
   _Neighborhood Sentiment (10%):_ Historical review ratings and completion rates.

**Business Rule Enforcement:**
Guarantees that only active, approved listings from verified providers enter the recommendation pool. Sponsored ad bidding is strictly excluded from altering algorithmic weights.

4. Optional Recommendation Layer & AI Fallback (AIF-007)
   **Semantic & Vector Matching:** Integrates optional AI-assisted ranking hints to refine provider ordering based on historical user behavior.
   **Graceful Degradation (AIF-007):** If the external AI vector service or recommendation gateway times out or throws an exception, the system catches the error and seamlessly falls back to standard geospatial sorting by proximity and rating, ensuring system uptime.
