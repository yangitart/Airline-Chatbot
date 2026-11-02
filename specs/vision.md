# Product vision: Air India travel assistant

## Product goal
Build a web assistant inspired by Air India's Maharaja experience. Travelers should be able to ask about policies and services, search flight information, and continue a natural multi-turn conversation.

## Users
- Travelers who need clear Air India policy or flight information.
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

## Architecture constraints
- Next.js App Router at the repository root owns UI and server-side Route Handlers/Server Actions.
- Supabase Auth manages Google identity and sessions; Supabase Postgres stores application data under RLS.
- Vercel hosts the Next.js application. Supabase provides the managed data/auth platform.
- Provider credentials and model/RAG calls remain server-side.

## Current implementation status
The repository currently contains the landing flight-search view, mock search Route Handler, Google OAuth through Supabase, English/Spanish UI resources, and the feature/core/ioc architecture. The chat, LLM, RAG, source ingestion, intent classifier, and evaluation benchmark are not yet implemented.
