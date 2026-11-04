# Plan: demo checkout and trip operations

Stripe Checkout is created only in a server Route Handler after verifying the Supabase user owns the booking. The server loads the amount/currency from Postgres and creates a test-mode Checkout Session. A signed webhook endpoint validates the raw Stripe payload and calls a narrowly scoped Supabase RPC using a server-only service credential; it updates payment state and records the event atomically. The success page only reads the stored state.

Add `profiles` with owner RLS, payment/session fields and webhook-event idempotency, plus owner-scoped demo check-in rows per itinerary leg. Expired Checkout Sessions release reserved demo inventory exactly once. Route Handlers compose request-scoped feature use cases/repositories over Supabase data sources; Stripe signature verification stays at the webhook boundary. Check-in uses a clearly labeled demo policy window and never returns a real ticket.

Keep API keys in server-only environment variables. Test with Stripe's test keys and Stripe CLI; never store card data. Verify profile ownership, webhook signature/idempotency, booking ownership, payment transitions, check-in eligibility, and both locales.
