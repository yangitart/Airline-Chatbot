# Tasks: Veyra travel assistant

**Spec:** spec.md  
**Plan:** plan.md

## Tasks
- [x] T001 [spec] Separate Veyra FAQ authorship from the archived airline research.
- [x] T002 [content] Author 21 Veyra FAQ topics in English and Spanish.
- [x] T003 [frontend] Use one local catalog for FAQ index, route validation and category search.
- [x] T004 [knowledge] Add bilingual human-review PDF export and a Gemini-embedding JSON-to-pgvector import flow.
- [x] T005 [chat] Reconnect versioned FAQ retrieval behind a configuration flag.
- [x] T006 [chat] Default generation to Gemini and make provider selection configurable on the server.
- [x] T007 [navigation] Remove offsite links from the route network and experience pages.
- [x] T008 [scroll] Use the Veyra canvas for overscroll on the shared pages.
- [x] T009 [performance] Keep the launcher fixed to the viewport, load history on demand and read ten context messages in one request.
- [x] T010 [quality] Run focused content, history, and trip action tests, typecheck, and production build.
- [ ] T011 [setup] Apply and verify the pending chat-history migration and owner-scoped history persistence.
- [x] T012 [chat] Connect booking list and details, payment status, and stored flight status to the chat using the existing server use cases.
- [x] T013 [chat] Add confirmed checkout for existing bookings and demo check-in by leg.
- [ ] T014 [quality] Review the signed-in chat and trip operations with Supabase and Stripe test mode, including account isolation and ineligible operations.
- [x] T015 [knowledge] Replace local feature hashing with Gemini retrieval embeddings and add schema preflight before publication.
- [x] T016 [chat] Keep retrieval disabled by default until the corpus and remote migrations are ready.
- [ ] T017 [setup] Apply the pending FAQ migrations, publish the bilingual Veyra corpus, enable RAG locally and in Vercel, and review grounded answers and abstention.

## Verification
- FAQ coverage: 21 local categories with three question and answer pairs in English and Spanish. Original Veyra authored FAQ is disconnected from the archived Air India source set.
- Validation: the FAQ catalog check covers 21 local categories with three Q&A pairs per topic in English and Spanish. Scroll bounce is backed by the HTML and body canvas colors plus overscroll containment; the removed route-map and experience links no longer point outside Veyra.
- Trip tests cover exact booking lookup, flight query validation, and confirmation before checkout or check-in.
- RAG dry-run validated 42 authored documents and 126 bilingual Q&A chunks. The Gemini key generated normalized 1,536-dimensional `RETRIEVAL_DOCUMENT` and `RETRIEVAL_QUERY` vectors; a cross-phrase English check scored 0.68. Syntax and type checks passed.
- The remote REST schema still returns `PGRST205` for `faq_corpus_versions`; the Supabase CLI migration-list request timed out. Apply the FAQ migrations and publish the corpus before enabling retrieval.
