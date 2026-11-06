# Product roadmap

**Status:** Proposed capability sequence; individual future features still require their own reviewed specs.  
**Last updated:** 2026-11-06

This roadmap grows the current landing page into a travel service. It is a sequencing guide, not a claim that Air India APIs or live operational data are available. Every screen must distinguish seeded/demo records from information confirmed by an authorized source.

## Stage 0 — Foundation (implemented)

- Next.js App Router application with feature, domain, data, and IoC layers.
- Supabase Google authentication.
- Responsive home page with public search and Google sign-in.
- English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese interface.

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

## Stage 2 — Demo checkout and trip operations

**Spec:** `003-travel-operations-and-checkout` (Code and AIRLINE migrations applied; awaiting Stripe test verification and signed-in hosted flow review)

- Test-mode Stripe Checkout and signature-verified webhooks.
- Owner-scoped profile editing, per-leg demo check-in, flight-status lookup, expiry-safe inventory, and improved booking details.
- Demo statuses only; no real payment, ticket, or airline action.

## Stage 3 — Visual design polish

**Spec:** `004-visual-design` (Implementation in progress)

- Unify the visual language across search, sign-in, results, My Trips, profile, flight status, and the three public navigation pages.
- Improve responsive composition, form/card states, accessibility, and visual hierarchy without changing service behavior.
- Support English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese in the language card and profile preference.
- Keep the warm premium palette and use Tailwind utilities; no Three.js or backend work.

## Stage 4 — Veyra assistant and local help

**Spec:** `005-travel-assistant` (implementation in progress)

- Persist owner-scoped conversation history in Supabase with RLS and user controls to reopen/delete conversations.
- Keep the 21 original Veyra FAQ articles in local English and Spanish catalogs.
- Use Gemini generation by default, with Groq and OpenAI selectable through server configuration, and safe flight-search/confirmed Stripe test-checkout actions by reusing existing services.
- Connect the chat to saved trips, booking and payment status, checkout for eligible existing bookings, demo check-in by leg, and stored flight status.
- Live airline inventory, status, and ticket issuance depend on airline integrations. Changes, cancellations, and refunds require booking use cases before they can be offered in chat.

## Stage 5 — Veyra PDF and FAQ retrieval

The Gemini embedding and hybrid Supabase retrieval code is prepared. The hosted FAQ tables are currently missing (`PGRST205`); apply migrations and publish the reviewed corpus before enabling retrieval.

- Keep PDFs as human review copies and index the canonical Veyra JSON with `gemini-embedding-001` into a versioned Supabase `pgvector` corpus with category and question provenance.
- Combine vector and keyword search, cite local FAQ articles, and abstain when evidence is missing, stale, or conflicting.
- The publisher validates the hosted schema before making embedding requests or writes. Run a dry run and review the corpus before publication; evaluate retrieval before setting `CHAT_FAQ_RAG_ENABLED=true`.

The Air India extraction is archived research material and is not a Veyra policy source.

## Stage 6 — Manage a trip

Create a separate spec after the demo booking flow is accepted.

- Retrieve bookings by account and show the saved itinerary, booking status, and fare snapshot.
- Add seat selection, upgrades, and ancillaries only when a provider exposes their availability and price.
- Add cancellation, changes, refunds, and re-accommodation with provider rules and confirmed outcomes. Connect those operations to the chat when their server use cases are available.

**Dependencies:** provider-supported booking management, secure traveler verification, fare rules, payment/refund support, and audit history.

## Stage 7 — Additional journey operations

Create a separate spec for each operation or cohesive slice.

- Flight schedule/status lookup with data freshness and source attribution.
- Web check-in availability, passenger eligibility, seat/meal selection, and boarding-pass handling where integration permits.
- Checked-bag tracking and disruption notifications when a baggage or operations feed is available.
- Show eligibility windows and unsupported cases instead of simulating a successful airline action.

**Dependencies:** live flight-operations and check-in interfaces, identity/PNR verification, codeshare rules, and event delivery. Air India's public pages describe capabilities and policies; they do not themselves provide an integration contract.

## Stage 8 — Additional travel services

Treat each external service as an optional, independently specified integration.

- Maharaja Club profile, points, tier benefits, and member fares.
- Offers, gift cards, hotels, cars, and other add-ons.
- Loyalty or partner data must be sourced and authorized; do not infer balances, discounts, or availability locally.

## Cross-stage requirements

- **Truthfulness:** data source, demo/live status, freshness, and operation outcome remain visible and accurate.
- **Security:** Supabase RLS protects application records; provider secrets and authenticated operational calls remain server-side.
- **Architecture:** vertical features own UI, domain, data adapters, and IoC; Next Route Handlers stay thin.
- **Localization/accessibility:** all six supported locales for customer-facing flows, keyboard access, responsive layouts, and clear loading/error/empty states.
- **Quality:** focused domain/API/database tests, operational logs without sensitive data, and evaluation for assistant answers before release.

## Readiness gates

Before starting a stage, create its `spec.md`, `plan.md`, `checklist.md`, and `tasks.md`; identify data/API providers and sandbox access; agree on user-visible status semantics; define RLS/privacy; and keep the feature Draft until open decisions are resolved. Mark work implemented only with code and verification evidence.
