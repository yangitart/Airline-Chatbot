# 003: Demo checkout and trip operations

**Status:** In progress; feature code and migrations 001–006 are applied locally and on AIRLINE. Stripe test keys/webhook and authenticated end-to-end verification remain.

## Goal

Finish the current flight journey so a traveler can review a saved booking, pay through Stripe Checkout in test mode, update a basic profile, check in to an eligible demo flight, and look up demo flight status. Improve the booking and account screens so each step has clear status and next actions.

## In scope

- Stripe test-mode Checkout session for an authenticated user's demo booking. The server calculates the amount from the stored booking; the browser never supplies the charge amount.
- Verify Stripe webhook signatures and update payment status idempotently. A successful test payment marks a demo booking paid; it never means an airline ticket was issued.
- Profile view and editing of basic contact/display fields under Supabase RLS.
- Demo check-in for each eligible paid itinerary leg, returning a clearly labeled demo pass reference and seat.
- Flight-status lookup from stored AviationStack-shaped demo status records.
- Better booking detail, payment state, profile, check-in, and status UI in the six supported locales: English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese.

## Out of scope

- Live card charges, real ticket issuance, airline check-in, or actual boarding passes.
- Live Amadeus/AviationStack API calls, refunds, cancellation, seat maps, passport data, or storing payment details.

## Acceptance criteria

- [ ] The authenticated traveler can start Stripe Checkout in test mode for their booking only.
- [ ] A verified Checkout webhook marks payment as test/demo-paid; a browser return URL alone cannot mark it paid.
- [ ] Duplicate webhook events do not apply payment state twice; invalid signatures are rejected.
- [ ] Profile changes are private to the signed-in owner and do not overwrite Supabase Auth identity.
- [ ] Eligible demo bookings can be checked in once and receive a demo seat/boarding-pass reference; ineligible/expired trips receive a clear explanation.
- [ ] Flight status search returns the stored demo record and labels its source/status as demo.
- [ ] My Trips exposes itinerary, fare, payment state, check-in state, and the available action for each record.
- [ ] All six supported locales, keyboard operation, loading/errors, and responsive layouts work across these flows.
- [ ] Migration, local test-mode payment/webhook, RLS, and production build checks pass.

## Setup and open conditions

- Configure server-only `STRIPE_SECRET_KEY` (`sk_test_...`) and `STRIPE_WEBHOOK_SECRET` (`whsec_...`). Never use a live key for demo bookings.
- Use Stripe CLI or a configured test webhook to forward signed events to the local Next.js endpoint.
- Apply the new Supabase migrations locally and remotely before using the new profile/payment/check-in fields. (Completed for local Supabase and AIRLINE on 2026-11-03.)
- Store webhook event IDs for idempotency. Keep card data entirely in Stripe Checkout.
