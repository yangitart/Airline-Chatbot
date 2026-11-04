# Product vision: Air India travel assistant

## Product goal
Build a web travel assistant inspired by the service experience described on Air India's public site. Travelers should be able to get grounded travel information, search and review flight offers, and use supported booking and trip-management tasks through a helpful multi-turn assistant.

## Users
- Travelers who need clear Air India policy or flight information.
- Travelers who want to plan, book, and review trip details through a single web experience.
- Reviewers evaluating a working AI product, data grounding, code quality, and deployment.

## Core requirements
- A chat interface where users can ask questions and read responses.
- Server-side LLM integration using a provider selected in the implementation plan.
- Multi-turn context that handles references to earlier messages.
- Helpful Air India assistant persona and safe out-of-scope responses.
- Graceful handling of empty input, provider/network failures, and unsupported requests.
- A live demo and README explaining design choices, completed scope, and limitations.

## Expected requirements
- RAG over verified Air India policy/FAQ sources, returning citations and abstaining when evidence is insufficient.
- Flight search using a real source or clearly labeled mock data.
- Intent handling for policy, flight search, and general/out-of-scope travel requests.

## Bonus goals
- A small quality evaluation set/benchmark for relevance, grounding, and latency.
- Verified real Air India source data and a repeatable refresh process.
- Streaming responses, Hindi and English support, and polished responsive styling.

## Service capability direction

The product may grow across these capabilities, in sequence: database-backed flight search and demo booking; demo checkout, profile, check-in, and flight status; then a grounded AI Agent and RAG over verified travel information. See `roadmap.md` for boundaries and provider prerequisites.

Public website pages describe customer-facing capabilities and policies. They do not establish that Air India exposes an API, licensed inventory feed, or permission to perform transactions. Live search, ticketing, check-in, payment, seat selection, baggage tracking, refunds, loyalty, and partner services require an authorized data or transaction provider. Persisted seed data must remain labeled as demo.

## Architecture constraints
- Next.js App Router at the repository root owns UI and server-side Route Handlers/Server Actions.
- Supabase Auth manages Google identity and sessions; Supabase Postgres stores application data under RLS.
- Vercel hosts the Next.js application. Supabase provides the managed data/auth platform.
- Provider credentials and model/RAG calls remain server-side.

## Current implementation status
The repository contains the landing flight-search view, Google OAuth configured on the AIRLINE project, Supabase-backed search/demo-booking code, English/Spanish UI resources, and the feature/core/ioc architecture. The current travel-operations slice adds test-mode Stripe Checkout/webhook code, owner-scoped profile editing, per-leg demo check-in, stored flight-status lookup, and a richer trip view. Migrations 001–006 are applied locally and on AIRLINE; local RLS/check-in/expiry paths, hosted search/status, and production build are verified. Stripe payment/webhook end-to-end verification still needs a configured deployment webhook, and the authenticated booking/profile flow still needs a signed-in hosted review. Chat, LLM, policy ingestion, RAG, intent handling, and evaluation remain part of the overall product vision but are outside the active feature specs.
