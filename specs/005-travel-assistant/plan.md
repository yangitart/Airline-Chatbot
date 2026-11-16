# Implementation plan: Veyra travel assistant

**Spec:** spec.md

## Design

The shared travel shell hosts the chat panel. `features/chatbot` owns the streaming client, history, provider adapters and server orchestration. Existing flight search, booking and checkout remain the source of transaction rules.

The FAQ views and indexer use the original Veyra JSON catalogs. The old Air India HTML/PDF crawler is disconnected from runtime. RAG stays off unless `CHAT_FAQ_RAG_ENABLED=true` and a published Veyra corpus is available.

## Data flow

1. The client sends the conversation ID, new message and selected UI language through the injected send-message use case, chat repository and API data source.
2. The route validates the session and input, then loads at most ten prior messages in one owner-scoped Supabase request.
3. When RAG is enabled, the server creates a Gemini `RETRIEVAL_QUERY` embedding and retrieves language-filtered evidence through the versioned hybrid Supabase RPC. The selected generation provider (Gemini by default; Groq or OpenAI by server configuration) streams text, uses that evidence for policy answers, and can call flight search, saved-booking lookup, and stored flight-status tools.
4. The server stores completed user and assistant messages atomically.
5. Offer cards show the current inventory. Booking and test checkout use the booking feature's public client use cases and existing endpoints after explicit confirmation.

## Layer boundaries

Browser composition registers data sources, repositories and use cases independently. `ChatModule` injects the shared Axios `REST_CLIENT` into the chat API data source through `applyDependencies`. History uses its JSON requests; streaming uses the same client with Axios's fetch adapter, `responseType: "stream"`, and a 100-second timeout. Request cleanup aborts the transport before closing the SSE reader. Data sources, repositories and provider adapters are function factories that capture injected dependencies in closures. The UI consumes use cases through `chatServices`; chat cards consume `bookingServices` and never import booking transport implementations. API/Supabase sources perform transport operations, data models describe transport payloads, mappers convert them, and repositories implement domain contracts and map failures. Chat preserves its stable `ChatError` contract; booking operations use the existing `Either` contract.

History uses a Supabase source plus a history repository. FAQ retrieval uses an embedding provider, a Supabase source, and a retrieval repository; the embedding module shared with the indexer remains the model/dimension source of truth. Server composition remains request-bound, and RAG stays behind its existing flag.

## Trip operations

The booking card fetches current details when the traveler selects a saved trip. It displays booking and payment state and asks for confirmation before calling checkout or check-in for the selected leg. The check-in result appears in the card. The flight status card shows the stored flight record and its timestamp. Trip actions are independent of FAQ retrieval.

## Errors and security

Return stable error codes. Distinguish an expired login from an authentication service outage. Map database, provider and stream failures at their boundary, and log only the operation and error code. Cancel provider streams when the browser disconnects. Bound timeouts, payload and context.

## Verification

Focused tests cover the bounded history query and FAQ content catalog. Typecheck and production build validate the application. Review the selected locale, stream error recovery, confirmation flow and page navigation.

## Rollout

Configure `GEMINI_API_KEY`, apply the pending migrations, run the FAQ indexer to publish the canonical bilingual catalog, then enable `CHAT_FAQ_RAG_ENABLED`. Verify schema preflight, semantic and keyword retrieval, citations, language filtering, and abstention before enabling it in Vercel.
