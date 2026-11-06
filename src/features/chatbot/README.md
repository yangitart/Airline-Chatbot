# Veyra travel assistant

See [spec 005](../../../specs/005-travel-assistant/spec.md) for the active scope and rollout gates.

- The chat panel is hosted in the shared travel shell and uses the current forest, ivory, and gold palette.
- Provider tokens stream to the panel, and responses follow the currently selected site locale.
- Conversation history is stored in Supabase with owner-only RLS; list, reopen, new-chat, and delete are supported.
- OpenAI is the only active generation provider. Gemini and Groq adapter files remain in the repository for a later provider-factory change, but require no configuration now.
- FAQ indexing files and migrations remain available for a later RAG phase. The active chat does not calculate embeddings or query the FAQ index.
- The local FAQ pages remain available. The assistant currently focuses on chat, flight search, saved trips, payment status, test checkout, check-in, and stored flight status.
- The flight search card supports selecting offers and confirming a new booking with Stripe test checkout.
- Chat can list and open saved bookings, show booking and payment status, and look up stored flight status through the existing feature services. It fetches current booking details when the traveler opens a booking card. The traveler can confirm checkout for an eligible saved booking or demo check-in for a specific leg from that card. These operations work with FAQ retrieval disabled.
- Resume RAG only after the chat and trip operations are verified.
