# Checklist: demo checkout and trip operations

**Status:** In progress; code and migrations are in place locally and on AIRLINE, pending configured Stripe webhook and end-to-end verification.

- [x] Checkout rejects non-test Stripe keys and keeps all Stripe/service-role credentials server-only.
- [x] Payment state changes through a signature-verified webhook, never from the browser redirect.
- [x] Webhook records event IDs idempotently and handles completion, asynchronous failure, and expiry.
- [x] Profile and booking state use RLS/owner-scoped access; webhook event table is server-only.
- [x] Demo check-in and status are labeled as sample data and do not claim ticket issuance.
- [x] Booking, profile, check-in, and status screens include English/Spanish copy and status/error feedback.
- [x] New migrations apply to the local Supabase stack; TypeScript typecheck passes.
- [x] Migrations 001–006 are recorded as applied in local Supabase and AIRLINE; optimized production build passes.
- [ ] Stripe test payment/webhook smoke test and authenticated hosted booking/profile verification pass.
