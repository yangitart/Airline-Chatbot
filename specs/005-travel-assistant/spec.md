# Feature specification: Veyra travel assistant

**Status:** In progress  
**Last updated:** 2026-11-06

## Problem
Travelers need original Veyra guidance, flight search and trip actions in one chat. Public airline research must not be mistaken for Veyra policy.

## User stories
- As a traveler, I want original Veyra FAQ articles by topic so I can find practical answers without leaving the site.
- As a traveler, I want to search flights and review the total in chat.
- As a traveler, I want to confirm an itinerary before Veyra creates its booking and test checkout.
- As a traveler, I want to manage my trips from chat, including finding an existing booking, checking its payment state, resuming an eligible checkout, and checking in for an eligible leg.
- As a traveler, I want the assistant and site text to follow my selected language.
- As a traveler, I want policy answers grounded in the local Veyra FAQ catalog with links to the relevant in-app article.
- As a maintainer, I want to select the chat model provider through server configuration without changing chat or trip-operation logic.

## Scope
### In scope
- Responsive Veyra chat launched from the shared navigation, with streaming, private account history and six UI languages.
- Original authored FAQ articles for all 21 local categories in English and Spanish.
- In-page question and answer search with links inside Veyra.
- Read-only flight search through the existing flights feature.
- Booking and Stripe test checkout after offer selection, fare review and explicit confirmation.
- Chat access to the existing booking list and details, payment status and checkout for an eligible saved booking, demo check-in by leg, and stored flight status.
- Server-side Gemini generation by default, with Groq and OpenAI adapters selectable by configuration, plus flight search and saved trip operations.
- Versioned hybrid FAQ retrieval from the English and Spanish Veyra catalogs using Gemini text embeddings and Supabase pgvector.

### Out of scope for this slice
- Importing Air India research as Veyra policy.
- Live inventory, ticket issuance, and live flight operations. Changes, cancellations, and refunds join the chat once Veyra has server use cases for them.

## Functional requirements
- **FR-001:** The chatbot opens from every shared travel section without changing the current route.
- **FR-002:** Conversations are stored under the signed-in account and can be listed, reopened and deleted.
- **FR-003:** Each FAQ category displays Veyra-authored answers from the local catalog in English or Spanish.
- **FR-004:** FAQ search filters both questions and answer text, and category links remain inside Veyra.
- **FR-005:** The assistant answers in the selected site language, even when the latest message uses another language.
- **FR-006:** Assistant text streams progressively and completed turns save to Supabase.
- **FR-007:** Natural-language flight requests call the existing search use case and display its returned inventory.
- **FR-008:** Booking and checkout require a selected itinerary and separate confirmation in the interface.
- **FR-009:** Payment and booking states come from existing endpoints and webhook processing.
- **FR-010:** Provider secrets and account history stay server side and owner scoped.
- **FR-011:** The active model provider defaults to Gemini and can be switched to Groq or OpenAI through server-only configuration without changing chat orchestration.
- **FR-014:** The assistant lists and opens the signed-in traveler’s bookings and displays the stored itinerary, reference, booking and payment states, and check-in status for each leg.
- **FR-015:** The traveler can start or resume an eligible booking’s Stripe test checkout and confirm demo check-in for a specific eligible leg from the chat panel. The server validates ownership and eligibility and returns the outcome for the panel to display.
- **FR-016:** The assistant looks up flight status using Veyra’s stored flight records and identifies them as demo data.
- **FR-017:** Booking and trip actions work independently of FAQ retrieval and reuse the same server use cases as the booking and trip screens. Before an action changes a booking or starts payment, the panel shows what will happen and requires explicit confirmation.
- **FR-018:** When `CHAT_FAQ_RAG_ENABLED` is true, retrieve only published `authored_faq` content for English or Spanish, combine semantic and keyword ranking, cite only retrieved passages, and abstain from policy claims when no useful evidence is returned.

## Non-functional requirements
- RLS limits each conversation and its messages to its owner.
- Request size, history, provider duration and tool calls are bounded.
- Failures return stable codes and recoverable messages. Logs exclude message content and raw provider bodies.
- The panel supports keyboard use, reduced motion and mobile screens.

## API contract
- `POST /api/v1/chat/messages` accepts a conversation ID, one new message and the selected supported locale.
- The server loads up to ten saved messages, streams SSE deltas, and saves the completed turn with its citations and any flight search, booking lookup, or flight status cards. A single card retains its original format. Multiple cards are grouped in the same turn.
- Before streaming starts errors use JSON. After streaming starts errors use an SSE error event.
- The booking card refreshes details through the existing booking endpoint. Checkout and check-in call their existing endpoints after confirmation.

## Acceptance criteria
- [x] 21 FAQ categories have three English and three Spanish authored question and answer pairs.
- [x] FAQ search covers the question and its answer text.
- [x] The Veyra FAQ view does not link to external airline pages.
- [x] The selected UI language is sent with each chat request.
- [x] Gemini is the default provider; Groq and OpenAI adapters are selectable. RAG is disabled by default and available behind `CHAT_FAQ_RAG_ENABLED` after corpus publication.
- [x] Gemini FAQ embeddings use `RETRIEVAL_DOCUMENT` and `RETRIEVAL_QUERY` with the same model and 1,536-dimensional normalized vectors. The indexer checks the schema before embedding or writing.
- [ ] Supabase migrations, a provider API key, and chat flow are verified end to end.
- [ ] Apply the FAQ migrations, publish the bilingual corpus, enable `CHAT_FAQ_RAG_ENABLED`, and verify retrieval, citations, language filtering, and abstention.
- [ ] Flight selection and test checkout confirmation are reviewed in the application.
- [ ] From chat, a traveler can find their own booking, see its current payment state, and resume an eligible checkout. A different account cannot access or act on that booking.
- [ ] From chat, a traveler can confirm check-in for the selected eligible leg, see the resulting demo pass reference, and look up stored flight status.

## RAG rollout
The JSON catalog is canonical. PDFs are review copies; the production index is a versioned Supabase pgvector corpus generated from the original FAQ JSON.

## Risks
- The extra locales display English FAQ articles until their content is translated.
- Flight inventory and checkout use the existing seeded records and Stripe test mode.
- Provider requests need server keys and rate limits before hosted use.
