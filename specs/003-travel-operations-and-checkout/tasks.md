# Tasks: demo checkout and trip operations

- [x] T001 Add migration for profile, payment state, Stripe event idempotency, and demo check-in state/RLS.
- [x] T002 Add server-only Stripe client and test-mode Checkout Session endpoint.
- [x] T003 Verify raw-body Stripe webhook signatures and process payment events idempotently.
- [x] T004 Add profile API/UI with owner-scoped update rules.
- [x] T005 Add demo check-in eligibility RPC/API and demo boarding-pass reference.
- [x] T006 Add flight-status query/UI from the AviationStack-shaped demo snapshot.
- [x] T007 Improve trip actions and add localized copy for the supported locales.
- [x] T008 Release demo inventory safely when a Checkout Session expires.
- [x] T009 Support separate, idempotent outbound and return demo check-in.
- [ ] T010 Verify local migration, RLS, Stripe test payment/webhook, and edge cases.
- [ ] T011 Update docs/spec evidence and mark completion only after end-to-end checks.

## Review follow-up (2026-11-15)

- [x] Prevent duplicate payment success notifications during repeated effects and language changes; require server-confirmed payment status.
- [x] Restore explicit demo/test wording for saved bookings, payment, and sample check-in results in all six supported locales.
- [x] Reject departed flights in the booking creation RPC, including stale browser selections.
- [x] Define and implement expiry/release for inventory held by saved bookings that never start Checkout: 30 minutes capped at departure, batched atomic release, minute Cron job, Checkout deadline recheck and failed-attachment cleanup.
- [x] Check lifecycle SQL in an isolated PostgreSQL database and add Checkout route regressions (elapsed hold, attachment failure, cleanup failure, successful attachment).
- [ ] Apply both November 15 migrations to the target Supabase project and verify Cron job runs and real Stripe delivery.
- Local checks cover payment lookup/webhook routes, check-in route rejections, and payment notifications. T010/T011 remain open until database/RLS and Stripe delivery are checked end to end.
