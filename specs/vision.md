# Product vision: Veyra travel assistant

## Product goal
Build Veyra as a web travel service with original travel guidance, searchable flight offers and supported trip actions through a helpful multi-turn assistant.

## Users
- Travelers who need practical answers about planning and using Veyra.
- Travelers who want to plan, book, and review trip details through a single web experience.
- Reviewers evaluating a working AI product, data grounding, code quality, and deployment.

## Core requirements
- A chat interface where users can ask questions and read responses.
- Server-side LLM integration using a provider selected in the implementation plan.
- Multi-turn context that handles references to earlier messages.
- Helpful Veyra assistant persona and safe out-of-scope responses.
- Graceful handling of empty input, provider/network failures, and unsupported requests.
- A live demo and README explaining design choices, completed scope, and limitations.

## Expected requirements
- Later RAG over reviewed Veyra FAQ PDFs, returning page citations and abstaining when evidence is insufficient.
- Flight search using a real source or clearly labeled mock data.
- Intent handling for policy, flight search, and general/out-of-scope travel requests.

## Bonus goals
- A small quality evaluation set/benchmark for relevance, grounding, and latency.
- Reviewed Veyra FAQ PDFs and a repeatable refresh process.
- Streaming responses, Hindi and English support, and polished responsive styling.

## Service capability direction

The product combines database-backed demo flight search and booking, demo checkout/profile/check-in/status, persistent chatbot history, original Veyra FAQs, flight search and confirmed test-checkout actions. Supabase RAG follows FAQ review and PDF export. See `roadmap.md` for boundaries and provider prerequisites.

Public website pages describe customer-facing capabilities and policies. They do not establish that Air India exposes an API, licensed inventory feed, or permission to perform transactions. Live search, ticketing, check-in, payment, seat selection, baggage tracking, refunds, loyalty, and partner services require an authorized data or transaction provider. Persisted seed data must remain labeled as demo.

## Architecture constraints
- Next.js App Router at the repository root owns UI and server-side Route Handlers/Server Actions.
- Supabase Auth manages Google identity and sessions; Supabase Postgres stores application data under RLS.
- Vercel hosts the Next.js application. Supabase provides the managed data/auth platform.
- Provider credentials and model/RAG calls remain server-side.

## Current implementation status
The repository contains 21 original FAQ topics in English and Spanish, the Google-authenticated search/booking flow, and six localized interfaces. Spec 005 adds the Veyra chat panel, selected-language streaming, Supabase history, flight search and confirmed Stripe test checkout. Chat history migrations remain unapplied to AIRLINE. FAQ RAG follows review and export of Veyra PDF content.
