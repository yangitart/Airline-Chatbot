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
