# Implementation plan: Veyra travel assistant

**Spec:** spec.md

## Design
The shared travel shell hosts the chat panel. `features/chatbot` owns the streaming client, history, provider adapters and server orchestration. Existing flight search, booking and checkout remain the source of transaction rules.

The FAQ views and indexer use the original Veyra JSON catalogs. The old Air India HTML/PDF crawler is disconnected from runtime. RAG stays off unless `CHAT_FAQ_RAG_ENABLED=true` and a published Veyra corpus is available.

## Data flow
1. The client sends the conversation ID, new message and selected UI language through the injected ChatClient.
2. The route validates the session and input, then loads at most ten prior messages in one owner-scoped Supabase request.
3. When RAG is enabled, the server creates a Gemini `RETRIEVAL_QUERY` embedding and retrieves language-filtered evidence through the versioned hybrid Supabase RPC. The selected generation provider (Gemini by default; Groq or OpenAI by server configuration) streams text, uses that evidence for policy answers, and can call flight search, saved-booking lookup, and stored flight-status tools.
4. The server stores completed user and assistant messages atomically.
5. Offer cards show the current inventory. Booking and test checkout use existing endpoints after explicit confirmation.

## Trip operations
The booking card fetches current details when the traveler selects a saved trip. It displays booking and payment state and asks for confirmation before calling checkout or check-in for the selected leg. The check-in result appears in the card. The flight status card shows the stored flight record and its timestamp. Trip actions are independent of FAQ retrieval.

## Errors and security
Return stable error codes. Distinguish an expired login from an authentication service outage. Map database, provider and stream failures at their boundary, and log only the operation and error code. Cancel provider streams when the browser disconnects. Bound timeouts, payload and context.

## Verification
Focused tests cover the bounded history query and FAQ content catalog. Typecheck and production build validate the application. Review the selected locale, stream error recovery, confirmation flow and page navigation.

## Rollout
Configure `GEMINI_API_KEY`, apply the pending migrations, run the FAQ indexer to publish the canonical bilingual catalog, then enable `CHAT_FAQ_RAG_ENABLED`. Verify schema preflight, semantic and keyword retrieval, citations, language filtering, and abstention before enabling it in Vercel.
