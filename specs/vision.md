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

The product may grow across these capabilities, in sequence: database-backed flight search and booking; trip history and supported booking management; flight status, check-in, and baggage operations; verified travel information and a grounded assistant; optional loyalty and partner services; then visual refinement. See `roadmap.md` for boundaries and provider prerequisites.

Public website pages describe customer-facing capabilities and policies. They do not establish that Air India exposes an API, licensed inventory feed, or permission to perform transactions. Live search, ticketing, check-in, payment, seat selection, baggage tracking, refunds, loyalty, and partner services require an authorized data or transaction provider. Persisted seed data must remain labeled as demo.

## Architecture constraints
- Next.js App Router at the repository root owns UI and server-side Route Handlers/Server Actions.
- Supabase Auth manages Google identity and sessions; Supabase Postgres stores application data under RLS.
- Vercel hosts the Next.js application. Supabase provides the managed data/auth platform.
- Provider credentials and model/RAG calls remain server-side.

## Current implementation status
The repository currently contains the landing flight-search view, Supabase-backed search and demo-booking code, Google OAuth, English/Spanish UI resources, and the feature/core/ioc architecture. The SQL migration and seed have not yet been applied to the configured Supabase project, so the database flow is not runtime-verified. The chat, LLM, RAG, source ingestion, intent classifier, evaluation benchmark, live inventory, payment, ticket issuance, and operational flight integrations are not yet implemented.
