# Product roadmap

**Status:** Proposed capability sequence; individual future features still require their own reviewed specs.  
**Last updated:** 2026-11-03

This roadmap grows the current landing page into a travel service. It is a sequencing guide, not a claim that Air India APIs or live operational data are available. Every screen must distinguish seeded/demo records from information confirmed by an authorized source.

## Stage 0 — Foundation (implemented)

- Next.js App Router application with feature, domain, data, and IoC layers.
- Supabase Google authentication.
- Responsive home page with public search, Google sign-in, and English/Spanish UI.
- English and Spanish interface.

See `001-google-auth-flight-search` for implementation evidence.

## Stage 1 — Database-backed search, booking, and trip history

**Spec:** `002-database-flight-booking` (Local booking flow and hosted search verified; hosted authenticated booking check remains)

- Search persisted flight offers using demo payloads shaped like Amadeus `flight-offer` records and normalized route/date/fare/availability columns.
- Keep AviationStack-shaped status snapshots in the database for the later journey-status slice.
- Review an offer before booking.
- Require sign-in to create a demo `flight-order` record and store it for the authenticated traveler.
- Prevent overbooking and stale-price confirmation; let travelers review their bookings.
- Start with clearly labeled seeded demo inventory if no operational source is available.

**Dependencies before a real purchase:** inventory/ticketing source, payment provider, passenger requirements, currency/tax rules, and hold/expiry behavior. Database persistence alone does not make the offer live or issue a ticket.

**Provider roles:** [Amadeus Self-Service](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/) is the candidate for a future bookable-offer lifecycle (search, reprice, order create/manage), subject to its production eligibility and ticket-issuance requirements. [AviationStack](https://aviationstack.com/pricing) is a candidate for flight status/operational schedules only; it cannot supply fare confirmation or book tickets. Keep these behind distinct server-side provider adapters.

## Stage 2 — Manage a trip

Create a separate spec after Stage 1 is accepted.

- Retrieve a booking by authenticated account and, if needed, a secure booking-reference flow.
- Show itinerary, passenger/booking status, fare snapshot, and available actions.
- Add seat selection, upgrades, and ancillary services only when the chosen booking source exposes their real availability and price.
- Add cancellation, change, refund, and re-accommodation requests only with provider rules, fee data, and confirmation callbacks.

**Dependencies:** provider-supported booking retrieval/change APIs, secure traveler verification, fare rules, payment/refund support, and audit history. Start with read-only trip details if write operations are unavailable.

## Stage 3 — Journey operations

Create a separate spec for each operation or cohesive slice.

- Flight schedule/status lookup with data freshness and source attribution.
- Web check-in availability, passenger eligibility, seat/meal selection, and boarding-pass handling where integration permits.
- Checked-bag tracking and disruption notifications when a baggage or operations feed is available.
- Show eligibility windows and unsupported cases instead of simulating a successful airline action.

**Dependencies:** live flight-operations and check-in interfaces, identity/PNR verification, codeshare rules, and event delivery. Air India's public pages describe capabilities and policies; they do not themselves provide an integration contract.

## Stage 4 — Travel information and customer support

Create a separate spec for verified content and the assistant.

- Organize baggage, airport, visa/document, medical, family/children, and pet-travel information.
- Build a reviewed source-ingestion and freshness process before answering policy questions.
- Add the required chat UI, selected server-side LLM, multi-turn context, intent routing, Air India assistant behavior, and grounded RAG citations.
- Abstain or direct travelers to official support when sources are missing, stale, conflicting, or require account-specific access.
- Add contact/support handoff if a supported channel and workflow are defined.

**Dependencies:** approved source list and usage terms, content review/update cadence, chosen LLM provider, privacy/retention rules, and evaluation set. Policies and personalized booking data must use separate access paths.

## Stage 5 — Additional travel services

Treat each external service as an optional, independently specified integration.

- Maharaja Club profile, points, tier benefits, and member fares.
- Offers, gift cards, hotels, cars, and other add-ons.
- Loyalty or partner data must be sourced and authorized; do not infer balances, discounts, or availability locally.

## Stage 6 — Visual refinement with Three.js

Begin only after the core search, booking, and account journeys work reliably.

- Add Three.js to selected presentation surfaces such as a route/destination hero or aircraft/seat visualization.
- Keep booking, pricing, inventory, authentication, and accessibility behavior in normal React components and server features.
- Lazy-load 3D assets, respect reduced-motion preferences, provide a static/mobile fallback, and measure loading/performance before broad use.
- Avoid making 3D a dependency for finding, reviewing, buying, or managing a trip.

## Cross-stage requirements

- **Truthfulness:** data source, demo/live status, freshness, and operation outcome remain visible and accurate.
- **Security:** Supabase RLS protects application records; provider secrets and authenticated operational calls remain server-side.
- **Architecture:** vertical features own UI, domain, data adapters, and IoC; Next Route Handlers stay thin.
- **Localization/accessibility:** English and Spanish for all customer-facing flows, keyboard access, responsive layouts, clear loading/error/empty states.
- **Quality:** focused domain/API/database tests, operational logs without sensitive data, and evaluation for assistant answers before release.

## Readiness gates

Before starting a stage, create its `spec.md`, `plan.md`, `checklist.md`, and `tasks.md`; identify data/API providers and sandbox access; agree on user-visible status semantics; define RLS/privacy; and keep the feature Draft until open decisions are resolved. Mark work implemented only with code and verification evidence.
