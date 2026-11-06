# Specification checklist: Veyra travel assistant

Spec: spec.md  
Status: In progress

## Product clarity
- [x] Current FAQ content is original Veyra copy.
- [x] Air India research is excluded from active chatbot answers.
- [x] PDF export is provided for review; the JSON catalog remains the canonical RAG input.
- [x] Retrieval accepts only published, authored Veyra entries in English or Spanish.

## Security and integrations
- [x] History access is owner scoped with RLS.
- [x] Flight search reuses the existing server use case.
- [x] Booking and checkout require confirmation and use existing Stripe test checkout.
- [x] Provider and stream errors use stable messages.

## User experience
- [x] FAQ articles exist in English and Spanish.
- [x] FAQ search covers question and answer text.
- [x] FAQ navigation stays inside Veyra.
- [x] Assistant responses follow the selected locale.
- [x] Responsive, keyboard and reduced motion states are specified.

## Readiness
- [ ] Supabase chat migrations applied to the target project.
- [ ] Provider key configured and chat verified against the provider.
- [ ] Booking and test checkout reviewed in the application.
- [x] Bilingual Veyra PDF exports and versioned Supabase indexing flow are prepared.
- [ ] Review the PDFs, apply migrations, configure server keys, publish a corpus and enable RAG.
