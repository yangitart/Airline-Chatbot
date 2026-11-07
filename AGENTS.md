# Airline Chatbot — agent instructions

## Product and current milestone
- Build the travel assistant as a Next.js application backed by Supabase Auth and Supabase Postgres.
- Current code includes Google authentication, public search of Supabase flight rows, demo bookings, Stripe test-mode Checkout wiring, owner-scoped profiles, demo check-in, and stored demo flight status lookup.
- Spec 005 uses Gemini by default for chat generation, with Groq and OpenAI selectable through the server-side provider composition. FAQ RAG uses Gemini embeddings and versioned Supabase pgvector retrieval; keep it behind `CHAT_FAQ_RAG_ENABLED` until the remote schema and Veyra corpus are ready. Persist owner-scoped conversation history in Supabase and route booking/payment actions through existing server use cases with explicit confirmation.
- Demo inventory stores Amadeus-shaped `flight-offer` JSON, demo orders store `flight-order` JSON, and demo operational snapshots use AviationStack-style nested flight data, alongside normalized columns for querying and transactions.
- Seeded flight schedules, availability, and fares are demo data even though they are stored and queried in Postgres. Stripe integration uses test keys and a verified webhook; it records a demo payment and never issues a ticket. Demo check-in produces a sample seat/reference, not an airline boarding pass.
- The FAQ uses 21 original Veyra catalogs under `src/features/faqs/data/veyra-faq.en.json` and `veyra-faq.es.json`. Other supported locales currently show the English FAQ article.
- Keep FAQ and experience links within Veyra. The archived Air India research is excluded from Veyra answers. The active chat does not query the FAQ index. JSON source and indexing tools remain prepared for a later RAG phase.

## Repository architecture
- src/app: Next.js App Router pages, layouts, metadata, callback routes, and thin Route Handlers/Server Actions.
- src/components: generic components reused across features. Form controls are Formik-aware adapters in components/forms.
- src/core: cross-cutting API clients, Supabase clients, routes, shared state, validation, locale, theme, and utilities.
- Keep core free of product-domain catalogues or validation rules; airport/flight rules belong in features/flights, and future RAG/policy rules belong in their own feature.
- src/features/<feature>: vertical slices with data, domain, ui, and ioc layers.
- src/ioc: Inversify composition root and common dependency wiring.
- specs: product vision, constitution, SDD workflow, and feature specifications.
- Keep automated tests outside `src/`, under `tests/features/<feature>/...`, preserving the tested feature's layer structure. Import application code through the `@/src/...` alias so moving tests does not break module paths.

## Frontend conventions

### Route and feature responsibilities
- Keep app/page.tsx and other route files thin; compose a feature view from the route.
- Feature-specific views, components, stores, and hooks live under features/<feature>/ui. For example, flight search belongs in features/flights/ui.
- Shared navigation/forms/design primitives belong in src/components only when multiple features can reuse them.
- The root travel shell owns the persistent navigation, session state, sign-in dialog, and section transitions. Travel views supply their own content through the shared section layout.

### Formik and shared components
- New forms use Formik. Create reusable Formik field adapters in src/components/forms with Formik hooks/context, labels, validation states, and accessible errors.
- Keep form layout and feature validation schemas inside the feature UI.
- Prefer semantic HTML, Tailwind/CSS, and the project's own shared components for new work. Do not introduce new HeroUI imports.
- Existing HeroUI components are legacy. Migrate a component when it is touched and confirm its consumers before removing it; do not bulk-delete components that older feature code still imports.
- Some inherited feature files still refer to removed Science Plan APIs/types and are not registered by the active app composition root. Do not wire those screens back in without migrating their dependencies to Airline/Supabase contracts.

### Internationalization
- Use the existing i18next/react-i18next setup in src/core/locales; do not hard-code user-visible copy in feature views/components.
- Add matching translation keys to every supported locale resource (`en`, `es`, `hi`, `fr`, `pt-BR`, `zh-CN`). Keep keys grouped by feature and avoid reusing keys whose meanings differ.
- Language selection goes through i18n.changeLanguage and persists the selected supported locale. Format dates/numbers using the active locale.

### Core API and Supabase
- Keep Supabase browser/server client factories under src/core/api/supabase. Client Components use the browser client; Server Components, Server Actions, Route Handlers, and middleware use the cookie-aware server client.
- Use @supabase/ssr for cookie-based sessions. The middleware refreshes sessions; the OAuth callback exchanges the PKCE code.
- Keep Supabase URL and publishable key in root .env.local and Vercel environment variables. Keep the server secret key (`SUPABASE_SECRET_KEY`, with legacy `SUPABASE_SERVICE_ROLE_KEY` fallback) out of `NEXT_PUBLIC` variables and browser code.
- Use Supabase Auth for Google sign-in. Use Supabase Postgres with RLS for application tables.
- Chat history is private account data: RLS must scope `chat_conversations` and `chat_messages` to the authenticated owner; the server loads context from the owner's saved messages instead of trusting browser-supplied transcripts.
- The archived Air India research corpus must never be used as Veyra guidance. Veyra FAQ records use `source_type='authored_faq'` and published versioning; retrieval filters to this type and the requested language. PDFs are review copies only; embeddings come from the canonical structured JSON.
- Stripe keys are server-only. Accept only `sk_test_` keys for demo checkout; verify webhook signatures against the raw request body and use the Supabase server-secret client only in the webhook handler. Never store card data or mark payment complete from a browser redirect.
- Demo check-in is stored per outbound/return leg. Use the owner-scoped RPC and show only sample seats/references; Stripe expiry releases demo inventory once using the idempotent event log.
- Owner profile data lives in `profiles` under RLS. Flight status and schedules are seeded AviationStack-shaped demo snapshots; always label them as demo and not live.
- Do not restore the old JWT token/refresh-cookie service; Supabase SSR owns auth session storage and refresh.
- Route Handlers in app/api are the Next.js server boundary for app-specific logic. Keep them thin and put orchestration/data access in feature data sources and use cases.
- A Route Handler validates/parses transport input, creates the server-side feature use case, and serializes the result. Keep mock fixtures, database queries, and business rules out of route.ts.
- Server repositories/data sources live under the owning feature's data layer. Use a request-bound Supabase server client for user-scoped queries; never cache a cookie-bound client in a global singleton. Route Handlers that require a signed-in user should get the client and verified user from `createAuthenticatedSupabaseContext`; routes return JSON through `jsonResponse`/`jsonError` in `src/core/api/http/jsonResponse.ts` so response shapes stay consistent.
- Keep domain repository interfaces free of Inversify imports. The ioc layer performs composition; client composition and request-scoped server composition are separate.
- The repository root is the Next.js app; deploy it to Vercel. Supabase supplies Auth and Postgres. Do not add a separate FastAPI service or Railway deployment.

### Feature data flow and Inversify
- Put API/Supabase transport calls in feature data_sources. Map transport models to domain models in data/mappers.
- Domain defines entities/types, repository interfaces, and use cases without importing Axios, Supabase, or React.
- Data repositories implement domain interfaces and convert transport errors using core/api response helpers.
- UI calls domain use cases, not fetch/Axios/Supabase directly.
- Register feature data sources, repositories, and use cases in the feature's ioc module. Register that module in src/ioc/application.container.ts after shared network/Supabase dependencies.
- Compose dependencies in the feature ioc layer with applyDependencies and Inversify. Export resolved feature services from feature ioc/*Services.ts facades; UI components consume those exports and must not call injector or access the application container directly.
- The root Inversify container is the client composition root. Server Route Handlers may use a feature server factory to compose request-side use cases/repositories; create cookie-bound Supabase clients once per request and pass that instance into the feature server factory. Do not put the cookie-bound client in the global container: each request carries its own cookies and user session. A request-scoped Inversify container is possible, but should only be introduced if it materially simplifies composition; it does not replace per-request client creation. Keep HTTP JSON serialization in the shared response helpers.
- The active flight Route Handler delegates to a server use case and a request-bound Supabase data source. `supabase/seed.sql` supplies demo inventory; it must remain labeled demo until a live provider is configured.
- Chat generation and embedding calls are server-side adapters under `features/chatbot`; use the same Gemini embedding model and dimensions for indexing and retrieval. Keep prompt/tool orchestration, SSE streaming, citations, selected-language enforcement, and history persistence in the feature's domain/data layers.
- Chat routes authenticate through the feature's request factory and reuse one cookie-aware Supabase client per request. The panel uses the injected chat API client for SSE and history. Return stable chat error codes in HTTP and SSE responses, and exclude message content and raw dependency errors from logs.
- Demo booking creation runs through `public.create_demo_booking`, which derives `auth.uid()`, locks inventory, checks availability, and writes an owner-scoped demo record atomically. The UI must not present it as a ticket or paid purchase.
- The GraphQL URL/query helpers still exist only for unregistered legacy user/nomenclature modules. Do not use them for Airline features; remove them once those legacy consumers are retired.

## Supabase security
- OAuth uses Supabase Auth's Google provider and PKCE callback. Configure the callback/redirect allowlist in Supabase and the Supabase callback URL in Google Cloud.
- Verify identity server-side with Supabase Auth claims/user methods before authorizing server operations; never trust a client-supplied user ID.
- Enable Row Level Security for every app-owned table and add only the policies required by the feature.
- Keep search demo data explicitly marked as mock. Account-free search must not reveal private user data.

## Working rules
- Keep code explainable to a junior engineer and make small, reviewable vertical changes.
- Update this file when architecture changes; update README and the active spec/tasks with setup and scope changes.
- Keep local secrets in ignored .env.local; update .env.example with variable names only.
- Add focused tests for new logic. Do not interact with the browser/UI unless the user explicitly requests it; static checks may be run from the terminal.
