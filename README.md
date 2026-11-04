# Airline Chatbot

Next.js App Router application using Supabase Auth and Postgres. The current slice provides Google sign-in, database-backed flight search, demo bookings and trip history, Stripe test-mode checkout wiring, profile editing, demo check-in, and stored flight-status lookup.

## Current flight data and booking limits

Flight rows are stored in Supabase and searched from the database. The included seed data is **demo inventory**; it is not live airline availability, cannot issue a ticket, and does not charge a payment method. Saved bookings are marked demo and reduce demo seat availability atomically.

The seed's `offer_payload` follows Amadeus's nested `flight-offer` shape, saved `flight_order_payload` follows the `flight-order` shape, and `flight_status_snapshots.status_payload` follows AviationStack's nested flight record. The app maps those payloads into its own UI model. No calls to either provider are made by the current demo adapter.

Stripe Checkout is restricted to test mode (`sk_test_...`) and demo bookings. A signed webhook records payment state; returning from Checkout alone never confirms payment. A successful demo payment is not an airline ticket. The check-in flow uses seeded schedules and creates only a sample seat and pass reference. Never enter real payment details or treat these records as travel documents.

Live ticket purchases require an authorized flight inventory/ticketing provider and a payment integration. Do not present demo bookings as purchased tickets.

The linked Airline project was migrated and seeded with demo records on 2026-11-03. Its flight rows and status snapshots are invented and must not be presented as live Air India data.

## Local setup

1. Install dependencies with `npm install` and make sure Docker Desktop is running with its Linux engine.
2. Start the local Supabase stack with `npx supabase start`. The first run downloads the containers, then applies `supabase/migrations` and `supabase/seed.sql`.
3. Run `npx supabase status` to get the local API URL and publishable/anon key. Use them for the local Next.js process; keep hosted project credentials separate.
4. Run `npx supabase db reset` to recreate the **local** database and replay every migration and seed from scratch. This deletes local test data.
5. Start Next.js with `npm run dev`.

For demo Checkout, add `STRIPE_SECRET_KEY` (`sk_test_...`), `STRIPE_WEBHOOK_SECRET` (`whsec_...`), and server-only `SUPABASE_SERVICE_ROLE_KEY` to the local environment. Forward Stripe test events to `/api/v1/stripe/webhook` with Stripe CLI. Configure these values in Vercel only when deploying the demo. Do not use a live Stripe key.

The CLI project config is `supabase/config.toml`. Optional Studio, storage, realtime, SMTP, edge runtime, analytics, and vector bucket services are disabled to reduce local image downloads; Postgres, Auth, and the API remain enabled. Google OAuth in the local stack needs its own local Auth provider setup. The hosted Google configuration is separate.

## Apply migrations to the hosted project

Use the Supabase CLI, not the app's publishable key. Sign in with a Supabase Personal Access Token and link the Airline project. Review pending changes with `npx supabase db push --dry-run --remote`, then apply them with `npx supabase db push --remote` when approved; include `--include-seed` only if the hosted demo catalog needs to be refreshed. If the CLI reports a database connection timeout, configure the project's database password as `SUPABASE_DB_PASSWORD` in the shell running the CLI, then retry. That value is distinct from the Supabase CLI access token and app publishable key; do not put it in client-visible environment variables. Do not run `db reset --remote` against a project with data you need.

The migration creates new app tables and policies; it does not drop `auth.users` or existing tables. `npm run dev` and the Vercel build never apply database migrations automatically.

## Main routes

- `/` — public flight search, offer selection, and demo booking flow.
- `/my-trips` — authenticated user's saved demo bookings.
- `/profile` — authenticated travel profile fields.
- `/flight-status` — public lookup against stored demo status snapshots.
- `GET /api/v1/flights/search` — reads matching flight and cabin inventory rows.
- `POST /api/v1/bookings` — creates an authenticated demo booking with an idempotency key.
- `POST /api/v1/bookings/{id}/checkout` — starts a test-mode Stripe Checkout Session for an owned demo booking.
- `POST /api/v1/stripe/webhook` — verifies and records Stripe test events.
- `POST /api/v1/bookings/{id}/check-in` — creates an eligible paid demo check-in for the outbound or return leg.
- `GET/PATCH /api/v1/profile` — reads or updates the authenticated user's profile.
- `GET /api/v1/flights/status` — searches seeded AviationStack-shaped demo status.
- `GET /api/v1/bookings` and `GET /api/v1/bookings/{id}` — reads only the authenticated user's bookings.

## Scripts

- `npm run dev` — development server.
- `npm run typecheck` — TypeScript check.
- `npm run build` — production build.
- `npm run test` — Vitest suite.

See `specs/roadmap.md` for upcoming booking, trip management, journey operations, grounded assistance, and later visual work.
