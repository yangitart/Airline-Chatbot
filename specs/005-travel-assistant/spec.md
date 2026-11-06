# Feature specification: Veyra travel assistant

**Status:** In progress  
**Last updated:** 2026-11-05

## Problem
Travelers need original Veyra guidance, flight search and trip actions in one chat. Public airline research must not be mistaken for Veyra policy.

## User stories
- As a traveler, I want original Veyra FAQ articles by topic so I can find practical answers without leaving the site.
- As a traveler, I want to search flights and review the total in chat.
- As a traveler, I want to confirm an itinerary before Veyra creates its booking and test checkout.
- As a traveler, I want to manage my trips from chat, including finding an existing booking, checking its payment state, resuming an eligible checkout, and checking in for an eligible leg.
- As a traveler, I want the assistant and site text to follow my selected language.
- As a maintainer, I want the active assistant to use OpenAI while keeping other provider adapters available for a later change.

## Scope
### In scope
- Floating, responsive Veyra chat with streaming, private account history and six UI languages.
- Original authored FAQ articles for all 21 local categories in English and Spanish.
- In-page question and answer search with links inside Veyra.
- Read-only flight search through the existing flights feature.
- Booking and Stripe test checkout after offer selection, fare review and explicit confirmation.
- Chat access to the existing booking list and details, payment status and checkout for an eligible saved booking, demo check-in by leg, and stored flight status.
- Server-side OpenAI generation and embeddings. Gemini and Groq adapter files remain inactive for now.
- A reviewable export and an explicit, versioned import flow for the authored FAQ catalog into Supabase pgvector.

### Out of scope for this slice
- Importing Air India research as Veyra policy.
- Activating FAQ RAG before the corpus is reviewed, migrated and published.
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
- **FR-011:** The active model provider is OpenAI; alternate provider adapters are not required in configuration.
- **FR-012:** FAQ indexing creates a versioned corpus from the English and Spanish structured catalogs, one retrieval chunk per question and answer, using 1536-dimensional OpenAI embeddings.
- **FR-013:** FAQ retrieval is disabled by default, filters to published Veyra-authored records in the selected language, and uses semantic plus keyword matching when explicitly enabled.
- **FR-014:** The assistant lists and opens the signed-in traveler’s bookings and displays the stored itinerary, reference, booking and payment states, and check-in status for each leg.
- **FR-015:** The traveler can start or resume an eligible booking’s Stripe test checkout and confirm demo check-in for a specific eligible leg from the chat panel. The server validates ownership and eligibility and returns the outcome for the panel to display.
- **FR-016:** The assistant looks up flight status using Veyra’s stored flight records and identifies them as demo data.
- **FR-017:** Booking and trip actions work independently of FAQ retrieval and reuse the same server use cases as the booking and trip screens. Before an action changes a booking or starts payment, the panel shows what will happen and requires explicit confirmation.

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
- [x] OpenAI is the only active provider and RAG has a disabled-by-default feature flag.
- [x] Migration, bilingual PDF export and versioned catalog indexing scripts are prepared.
- [ ] Supabase migrations, OpenAI key, corpus publication and chat flow are verified end to end.
- [ ] Flight selection and test checkout confirmation are reviewed in the application.
- [ ] From chat, a traveler can find their own booking, see its current payment state, and resume an eligible checkout. A different account cannot access or act on that booking.
- [ ] From chat, a traveler can confirm check-in for the selected eligible leg, see the resulting demo pass reference, and look up stored flight status.

## RAG rollout
The application uses the JSON catalog as canonical source. Exported PDFs are human review copies, not an ingestion dependency. After configuring OpenAI and Supabase server keys, apply migrations, review the PDFs, run the dry-run, publish a versioned index, and only then enable `FAQ_RAG_ENABLED`. The database query filters to `authored_faq` Veyra records and the requested locale; archived Air India research is excluded.

## Risks
- The extra locales display English FAQ articles until their content is translated.
- Flight inventory and checkout use the existing seeded records and Stripe test mode.
- Provider requests need server keys and rate limits before hosted use.
