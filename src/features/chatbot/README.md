# Veyra travel assistant

See [spec 005](../../../specs/005-travel-assistant/spec.md) for the active scope and rollout gates.

- The chat panel is hosted in the shared travel shell and uses the current forest, ivory, and gold palette.
- Provider tokens stream to the panel, and responses follow the currently selected site locale.
- Conversation history is stored in Supabase with owner-only RLS; list, reopen, new-chat, and delete are supported.
- Gemini is the default generation provider (`gemini-3.5-flash`). Select `gemini`, `groq`, or `openai` with the server-only `CHAT_AI_PROVIDER` setting; each adapter uses its own API key and optional model setting.
- FAQ RAG uses `gemini-embedding-001` with `RETRIEVAL_DOCUMENT` and `RETRIEVAL_QUERY` task types, 1,536-dimensional normalized vectors, and Supabase's versioned hybrid pgvector/keyword index. `CHAT_FAQ_RAG_ENABLED` stays false until migrations are applied and the authored Veyra catalog is published.
- The local FAQ pages remain available. The assistant currently focuses on chat, flight search, saved trips, payment status, test checkout, check-in, and stored flight status.
- The flight search card supports selecting offers and confirming a new booking with Stripe test checkout.
- Chat can list and open saved bookings, show booking and payment status, and look up stored flight status through the existing feature services. It fetches current booking details when the traveler opens a booking card. The traveler can confirm checkout for an eligible saved booking or demo check-in for a specific leg from that card. These operations work with FAQ retrieval disabled.
- Index only `src/features/faqs/data/veyra-faq.en.json` and `veyra-faq.es.json`. Preflight the hosted schema before embedding, publish to a staging corpus, and atomically switch the published version only after all documents and chunks are present.

## Architecture

Data sources, repositories and provider adapters are function factories. Dependencies such as the request-bound Supabase client and provider credentials are captured in closures; consumers call the factory directly. `SupabaseChatHistoryDataSourceImpl(supabase)`, for example, returns the history transport operations. Error types retain their `Error` subclasses.

The browser follows the same flow as flight search: UI -> use case -> repository -> data source. `chatServices` exposes the four client use cases; it does not expose an HTTP client. `ChatModule` registers each layer in Inversify, and `ChatSymbols` contains its dependency identifiers.

- `data/data_sources/ChatApiDataSource.ts` receives the shared Axios REST client through `ChatModule` and `applyDependencies`, sends history requests and decodes SSE frames. SSE uses Axios's fetch adapter with `responseType: "stream"`, retaining the same client defaults and interceptors. The message timeout is 100 seconds so the shared 15-second default does not cut off generation; closing the iterator aborts its request before releasing the SSE reader. `data/repositories/ChatRepositoryImpl.ts` interprets chat events and maps failures to stable `ChatError` codes. `data/mappers/ChatApiMapper.ts` validates and converts API payloads.
- `data/data_sources/SupabaseChatHistoryDataSource.ts` reads database rows and calls the atomic save RPC. `data/repositories/ChatHistoryRepositoryImpl.ts` maps rows and database failures to the domain contract. Row types live in `data/models`, and conversions live in `data/mappers/ChatHistoryMapper.ts`.
- FAQ retrieval composes `GeminiFaqEmbeddingProvider`, `SupabaseFaqDataSource`, and `FaqRetrieverImpl`. The provider embeds queries using the indexer's shared model and dimensions; the source calls Supabase; the repository selects the supported corpus language, filters weak matches, maps rows, and converts errors. Retrieval remains behind `CHAT_FAQ_RAG_ENABLED`.
- Booking cards call the public `bookings/ioc/bookingServices.ts` use cases. Creation and details reuse the existing booking repository; checkout and check-in use the booking actions repository. The chat does not import booking data sources or mappers. Booking use cases return `Either`; the UI's `readBookingResult` adapter turns a failure into a typed operation error for display and session recovery.

Server factories compose repositories and use cases for one request, using its existing cookie-aware Supabase client. The global browser container never owns that client. Chat retains its typed error contract for HTTP/SSE errors; bookings retain their existing `Either` contract. Provider/tool orchestration stays in `ProviderChatCompletionRepository`.
