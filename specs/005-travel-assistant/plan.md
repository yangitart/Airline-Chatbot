# Implementation plan: Veyra travel assistant

**Spec:** spec.md

## Design
The shared travel shell hosts the chat panel. `features/chatbot` owns the streaming client, history, provider adapters and server orchestration. Existing flight search, booking and checkout remain the source of transaction rules.

The FAQ UI and the index exporter read the original Veyra JSON catalogs. PDF files are for human review, while embeddings are generated directly from each question/answer entry. The old Air India HTML/PDF crawler is disconnected from runtime and retrieval.

## Data flow
1. The client sends the conversation ID, new message and selected UI language through the injected ChatClient.
2. The route validates the session and input, then loads at most ten prior messages in one owner-scoped Supabase request.
3. OpenAI streams text and can use the flight search, saved booking lookup, and stored flight-status tools. These tools read through the existing server use cases.
4. The server stores completed user and assistant messages atomically.
5. Offer cards show the current inventory. Booking and test checkout use existing endpoints after explicit confirmation.

## Trip operations
The booking card fetches current details when the traveler selects a saved trip. It displays booking and payment state and asks for confirmation before calling checkout or check-in for the selected leg. The check-in result appears in the card. The flight status card shows the stored flight record and its timestamp. Trip actions are independent of FAQ retrieval.

## Errors and security
Return stable error codes. Distinguish an expired login from an authentication service outage. Map database, provider and stream failures at their boundary, and log only the operation and error code. Cancel provider streams when the browser disconnects. Bound timeouts, payload and context.

## Verification
Focused tests cover the bounded history query and FAQ content catalog. Typecheck and production build validate the application. Review the selected locale, stream error recovery, confirmation flow and page navigation.

## Rollout
Apply pending Supabase migrations and configure `OPENAI_API_KEY`. Generate bilingual PDF review copies, run the FAQ index dry run, then publish a versioned bilingual corpus using the OpenAI key and Supabase secret key (the legacy service-role variable remains supported). Keep `FAQ_RAG_ENABLED=false` until corpus publication and review are complete. Flight checkout remains in Stripe test mode.
