# Tasks: Veyra travel assistant

**Spec:** spec.md  
**Plan:** plan.md

## Tasks
- [x] T001 [spec] Separate Veyra FAQ authorship from the archived airline research.
- [x] T002 [content] Author 21 Veyra FAQ topics in English and Spanish.
- [x] T003 [frontend] Use one local catalog for FAQ index, route validation and category search.
- [x] T004 [knowledge] Add bilingual human-review PDF export and a structured JSON-to-pgvector import flow.
- [x] T005 [database] Add versioned, bilingual hybrid retrieval restricted to Veyra-authored FAQ records.
- [x] T006 [chat] Make OpenAI the only active generation provider and keep RAG disabled by default.
- [x] T007 [navigation] Remove offsite links from the route network and experience pages.
- [x] T008 [scroll] Use the Veyra canvas for overscroll on the shared pages.
- [x] T009 [performance] Keep the launcher fixed to the viewport, load history on demand and read ten context messages in one request.
- [x] T010 [quality] Run focused content, history, and trip action tests, typecheck, and production build.
- [ ] T011 [setup] Configure OpenAI and Supabase server keys, apply pending migrations, publish the reviewed corpus, then enable RAG.
- [x] T012 [chat] Connect booking list and details, payment status, and stored flight status to the chat using the existing server use cases.
- [x] T013 [chat] Add confirmed checkout for existing bookings and demo check-in by leg.
- [ ] T014 [quality] Review the signed-in chat flow with Supabase and Stripe test mode, including account isolation and ineligible operations, with FAQ retrieval disabled.

## Verification
- FAQ coverage: 21 local categories with three question and answer pairs in English and Spanish. Original Veyra authored FAQ is disconnected from the archived Air India source set.
- Validation: the FAQ catalog check covers 21 local categories with three Q&A pairs per topic in English and Spanish. Scroll bounce is backed by the HTML and body canvas colors plus overscroll containment; the removed route-map and experience links no longer point outside Veyra.
- Trip tests cover exact booking lookup, flight query validation, and confirmation before checkout or check-in. The test suite, typecheck, and production build pass locally.
- Supabase migrations and index publication still need to be run against the target project. Retrieval remains disabled until that setup and the content review are complete.
