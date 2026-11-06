# Veyra travel assistant

See [spec 005](../../../specs/005-travel-assistant/spec.md) for the active scope and rollout gates.

- The chat panel is hosted in the shared travel shell and uses the current forest, ivory, and gold palette.
- Provider tokens stream to the panel, and responses follow the currently selected site locale.
- Conversation history is stored in Supabase with owner-only RLS; list, reopen, new-chat, and delete are supported.
- OpenAI is the only active generation provider. Gemini and Groq adapter files remain in the repository for a later provider-factory change, but require no configuration now.
- RAG is opt-in with server-only `FAQ_RAG_ENABLED=true`. It uses OpenAI embeddings and only retrieves published `authored_faq` Veyra records in the selected English or Spanish locale.
- The canonical knowledge source is `src/features/faqs/data/veyra-faq.en.json` and `veyra-faq.es.json`. PDFs are generated for human review; the indexing script embeds the structured catalog directly so extraction artifacts cannot corrupt the RAG source.
- Apply the Supabase migrations, review the generated PDFs, and publish a corpus with `npm run faq:index:publish` before setting `FAQ_RAG_ENABLED=true`.
- The flight search card supports selecting offers and confirming a new booking with Stripe test checkout.
- Chat can list and open saved bookings, show booking and payment status, and look up stored flight status through the existing feature services. It fetches current booking details when the traveler opens a booking card. The traveler can confirm checkout for an eligible saved booking or demo check-in for a specific leg from that card. These operations work with FAQ retrieval disabled.
- Retrieval is enabled only after publishing a reviewed Veyra JSON corpus. The generated PDFs are for human review and do not have to be reparsed.
