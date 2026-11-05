# Constitution

These principles govern every feature in Airline Chatbot and every agent change.

## 1. Ground airline claims in evidence
Policy answers must be supported by reviewed Air India source material. Preserve source URLs, titles, sections, and retrieval/fetch metadata. If retrieved evidence is missing, stale, or conflicting, say that the answer cannot be confirmed; never invent an airline policy.

## 2. Be honest about flight data and actions
Schedules, availability, prices, and booking outcomes are mock unless a configured real source confirms them. Mark demo results clearly. Never imply that a reservation, check-in, payment, or other transaction has completed unless a real integration confirms it.

## 3. Keep credentials and privileged work server-side
Use Supabase Auth sessions through the SSR cookie flow. Never expose a Supabase service-role key, LLM key, or provider secret in browser code or a NEXT_PUBLIC variable. Validate identity and authorization on the server before accessing protected data.

## 4. Enforce data access in PostgreSQL
Enable Row Level Security on every app-owned Supabase table exposed through the Data API. Add explicit least-privilege policies. Do not trust user IDs or roles supplied by the client.

## 5. Keep the architecture explainable and replaceable
Use Next.js Route Handlers as thin HTTP boundaries. Keep feature rules in domain/use-case/repository layers, transport in data sources, shared clients/helpers in core, and dependency wiring in Inversify. Hide LLM, embedding, retrieval, and flight providers behind small interfaces.

## 6. Fail safely and helpfully
Validate requests, limit conversation history and payload sizes, and handle empty input, unsupported intent, timeouts, rate limits, malformed provider data, and database errors without leaking secrets or stack traces.

## 7. Make the experience accessible and multilingual
Use semantic, keyboard-operable controls, visible loading/error states, and responsive layouts. User-visible strings belong in i18next resources. Keep every supported locale in sync; the current interface supports English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese.

## 8. Claim only what evidence supports
Specs describe intended behavior; tasks and completion reports describe implemented behavior. Mark requirements complete only when code and relevant verification support the claim. Document trade-offs and known limits for the exercise review.
