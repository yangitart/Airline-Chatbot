# Veyra Travel Assistant

Next.js App Router application using Supabase Auth and Postgres. The current slice provides Google sign-in, database-backed flight search, demo bookings and trip history, Stripe test-mode checkout wiring, profile editing, demo check-in, and stored flight-status lookup.

I originally planned Railway + FastAPI, but I ran out of Railway credits, so I rebuilt the slice on Supabase + Next.js to keep auth, database, and server routes in one managed stack. Gemini is the default chat provider. Veyra FAQ RAG uses Gemini text embeddings and Supabase pgvector, and remains disabled until its migrations and corpus are installed.

The travel assistant streams model responses in the selected site language and saves account-scoped chat history in Supabase. Search and trip actions use existing services and require explicit traveler confirmation. When RAG is enabled, FAQ evidence comes only from the bilingual, locally authored Veyra catalog; archived airline research is never used as answer evidence.

`TravelAssistantWidget` composes the launcher and dialog. Its feature UI hooks manage conversation requests/history and session-scoped greetings; separate components render the header, welcome topics, history and messages. Request cancellation, account-change cleanup and streaming updates stay together in `useAssistantConversation`.

## Current flight data and booking limits

Flight rows are stored in Supabase and searched from the database. The included seed data is **demo inventory**; it is not live airline availability, cannot issue a ticket, and does not charge a payment method. Saved bookings are marked demo and reduce demo seat availability atomically.

The seed's `offer_payload` follows Amadeus's nested `flight-offer` shape, saved `flight_order_payload` follows the `flight-order` shape, and `flight_status_snapshots.status_payload` follows AviationStack's nested flight record. The app maps those payloads into its own UI model. No calls to either provider are made by the current demo adapter.

Stripe Checkout is restricted to test mode (`sk_test_...`) and demo bookings. A signed webhook records payment state; returning from Checkout alone never confirms payment. A successful demo payment is not an airline ticket. The check-in flow uses seeded schedules and creates only a sample seat and pass reference. Never enter real payment details or treat these records as travel documents.

The UI distinguishes saving a demo booking, paying through test Checkout, and checking in each paid flight leg. Payment success notifications require a server-reported `paid` status and appear once per booking during a visit. Check-in opens 48 hours before departure and closes 60 minutes before departure; the owner-scoped database RPC enforces that window and reuses an existing check-in for the same leg.

Unstarted demo bookings hold seats for up to 30 minutes, capped at outbound departure. The November 15 migrations add `hold_expires_at`, reject departed flights in the booking RPC, and register the Supabase Cron job `expire-unstarted-demo-bookings` every minute. Each run releases up to 100 expired bookings atomically, restores both legs and the offer seat count, and marks the booking expired. Existing holds use their original creation time, so overdue unstarted reservations become eligible immediately after deployment. Linked Stripe sessions and paid reservations are excluded; linked sessions still rely on signed Stripe events for inventory release.

Apply `202611150001_demo_booking_hold_expiry.sql` and `202611150002_schedule_demo_booking_expiry.sql` before deploying the updated app. The second migration requires Supabase's [pg_cron extension](https://supabase.com/docs/guides/cron/install); migration failure must be resolved rather than skipping the scheduler. Confirm the named job and successful runs in Supabase Cron. Checkout checks the deadline before creating a Stripe session; the database checks it again when attaching that session. If attachment fails, the route attempts to expire the new session and never returns its URL.

The rollback-only regression script `tests/features/bookings/data/demoBookingLifecycle.sql` runs with `psql -v ON_ERROR_STOP=1 -f tests/features/bookings/data/demoBookingLifecycle.sql` against a disposable migrated database. It checks rejected past flights, hold deadlines, round-trip release, repeated expiry, protected paid/linked bookings, webhook expiry, and sweep permissions. Local SQL, route and component checks do not verify deployed migrations, Cron scheduling, or Stripe event delivery.

New demo fares are in USD. The catalog migration uses a fixed sample ratio of 85 INR per USD and leaves saved bookings and their Checkout Sessions in their original currency. Apply the November 8 payment and USD migrations before running the updated app against that database. For a hosted rollout, coordinate the app deployment with the migrations because they disable the old Checkout RPCs.

Live ticket purchases require an authorized flight inventory/ticketing provider and a payment integration. Do not present demo bookings as purchased tickets.

The linked Airline project was migrated and seeded with demo records on 2026-11-03. Its flight rows and status snapshots are invented and must not be presented as live Air India data.

The updated seed adds round trips between Delhi and London Heathrow and between Delhi and Singapore Changi. Refresh the demo catalog on an existing hosted project with `npx supabase db push --remote --include-seed` after reviewing the dry run. The home carousel lists destinations with available seeded flights. Carousel and search photos are credited next to the image.

## Local setup

1. Install dependencies with `npm install` and make sure Docker Desktop is running with its Linux engine.
2. Start the local Supabase stack with `npx supabase start`. The first run downloads the containers, then applies `supabase/migrations` and `supabase/seed.sql`.
3. Run `npx supabase status` to get the local API URL and publishable/anon key. Use them for the local Next.js process; keep hosted project credentials separate.
4. Run `npx supabase db reset` to recreate the **local** database and replay every migration and seed from scratch. This deletes local test data.
5. Start Next.js with `npm run dev`.

The chat follows `UI -> use case -> repository -> data source`, using function factories for services and keeping transport models and mappers in the data layer. The browser chat API receives the shared Axios REST client, including for streaming. Booking cards use the booking feature's public use cases. See [chat architecture](src/features/chatbot/README.md#architecture) for the browser/server flows and layer responsibilities.

## Travel assistant setup

Configure `CHAT_AI_PROVIDER=gemini` and `GEMINI_API_KEY` for chat responses. The default model is `gemini-3.5-flash`; override it with `GEMINI_CHAT_MODEL` if needed. The same server-only Gemini key generates FAQ embeddings with `gemini-embedding-001` at 1,536 dimensions. The server composition also supports `groq` (`GROQ_API_KEY`, optional `GROQ_CHAT_MODEL`) and `openai` (`OPENAI_API_KEY`, optional `OPENAI_CHAT_MODEL`) for generation. Use `SUPABASE_SECRET_KEY` or the existing `SUPABASE_SERVICE_ROLE_KEY` for server administration.

Apply the chat and FAQ migrations with `npx supabase db push --dry-run --remote`, review the pending migrations, then apply them with `npx supabase db push --remote`. Run `npm run faq:index:dry-run` to validate the canonical FAQ catalog, then `npm run faq:index:publish` to generate Gemini embeddings and publish a versioned corpus. Publishing checks that the required FAQ tables and retrieval RPC are present before making embedding requests or writing data. Set `CHAT_FAQ_RAG_ENABLED=true` locally and in Vercel only after publication; it defaults to `false`.

The original Veyra FAQ catalogs live in `src/features/faqs/data/veyra-faq.en.json` and `src/features/faqs/data/veyra-faq.es.json`. Those JSON files are the sole source for site FAQs and the RAG index; generated PDFs are review copies only.

For demo Checkout, add `STRIPE_SECRET_KEY` (`sk_test_...`), `STRIPE_WEBHOOK_SECRET` (`whsec_...`), and server-only `SUPABASE_SECRET_KEY` to the local environment. Forward Stripe test events to `/api/v1/stripe/webhook` with Stripe CLI. Configure these values in Vercel only when deploying the demo. Do not use a live Stripe key.

For Vercel, point a **test-mode** Stripe webhook at the public production URL plus `/api/v1/stripe/webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`. Use that endpoint's signing secret, which differs from the Stripe CLI secret. Apply the Supabase migrations to the same project the deployment uses.

If a trip remains in **Payment pending**, open its Checkout event in Stripe's event deliveries. A Vercel 401/redirect can mean Deployment Protection is blocking Stripe; a route 400 indicates a signature/configuration issue; 500 means the payment event could not be recorded. With the current handler, `200` and `applied: false` means the database did not apply a change (for example, it was already paid or the session/amount/currency did not match). Once the delivery issue is fixed, resend the original event and refresh payment status in My trips.

The CLI project config is `supabase/config.toml`. Optional Studio, storage, realtime, SMTP, edge runtime, analytics, and vector bucket services are disabled to reduce local image downloads; Postgres, Auth, and the API remain enabled. Google OAuth in the local stack needs its own local Auth provider setup. The hosted Google configuration is separate.

## Apply migrations to the hosted project

Use the Supabase CLI, not the app's publishable key. Sign in with a Supabase Personal Access Token and link the Airline project. Review pending changes with `npx supabase db push --dry-run --remote`, then apply them with `npx supabase db push --remote` when approved; include `--include-seed` only if the hosted demo catalog needs to be refreshed. If the CLI reports a database connection timeout, configure the project's database password as `SUPABASE_DB_PASSWORD` in the shell running the CLI, then retry. That value is distinct from the Supabase CLI access token and app publishable key; do not put it in client-visible environment variables. Do not run `db reset --remote` against a project with data you need.

The migration creates new app tables and policies; it does not drop `auth.users` or existing tables. `npm run dev` and the Vercel build never apply database migrations automatically.

## Main routes

- `/` — public flight search, offer selection, and demo booking flow.
- `/my-trips` — authenticated user's saved demo bookings.
- `/profile` — authenticated travel profile fields.
- `/flight-status` — public lookup against stored demo status snapshots.
- `/where-we-fly` — explore available route pairs and open the flight search with a route selected.
- `/prepare-to-travel` — quick links to baggage, FAQ, web check-in, and flight-status information.
- `/experience` — explore Veyra travel resources and local guides.
- `/faqs` and `/faqs/{category}` — browse 21 searchable Veyra FAQ articles without leaving the app.
- `GET /api/v1/flights/search` — reads matching flight and cabin inventory rows.
- `POST /api/v1/bookings` — creates an authenticated demo booking with an idempotency key.
- `POST /api/v1/bookings/{id}/checkout` — starts a test-mode Stripe Checkout Session for an owned demo booking.
- `POST /api/v1/stripe/webhook` — verifies and records Stripe test events.
- `POST /api/v1/bookings/{id}/check-in` — creates an eligible paid demo check-in for the outbound or return leg.
- `GET/PATCH /api/v1/profile` — reads or updates the authenticated user's profile.
- `GET /api/v1/flights/status` — searches seeded AviationStack-shaped demo status.
- `GET /api/v1/bookings` and `GET /api/v1/bookings/{id}` — reads only the authenticated user's bookings.
- `POST /api/v1/chat/messages` — streams a response using the authenticated user's saved conversation and supported tools.
- `GET /api/v1/chat/conversations` and `GET/DELETE /api/v1/chat/conversations/{id}` — list, reopen, and delete only the signed-in user's chat history.

## Scripts

- `npm run dev` — development server.
- `npm run typecheck` — TypeScript check.
- `npm run build` — production build.
- `npm run test` — Vitest suite.

See `specs/roadmap.md` for the current operations slice, the active visual polish work, and later product phases.

Each of the 21 Veyra FAQ topics has authored English and Spanish content. Other supported interface languages display the English FAQ article until translations are prepared.
