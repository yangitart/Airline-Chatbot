# Tasks: visual design polish

**Spec:** spec.md  
**Plan:** plan.md

## Tasks
- [x] T001 [audit] Inventory the active views, shared controls, font/image assets, breakpoints, and state variants; record the baseline.
- [x] T002 [foundation] Define palette/type/spacing tokens, shared patterns, and reusable reduced-motion-aware CSS animations.
- [x] T003 [navigation] Refine the global header, alert, language selector, service tabs, and Google sign-in modal transitions.
- [x] T004 [search] Refine hero/search composition, the original flight-path motif, Formik fields, validation, public results, booking feedback, and responsive behavior.
- [x] T005 [account] Refine My Trips cards, payment/check-in statuses and actions, profile, and flight-status views with consistent motion and responsive states.
- [x] T006 [navigation] Implement Where We Fly, Prepare to Travel, and Air India Experience pages; connect header navigation and route-prefilled flight search.
- [x] T007 [cleanup] Remove unused Tailwind palette entries and layout variables after repository-wide consumer checks; retain legacy global styles that still serve inherited components.
- [x] T008 [i18n] Add Hindi, French, Brazilian Portuguese, and Simplified Chinese resources; expand the flag-card picker and profile preference options.
- [x] T009 [database] Add a migration extending the profile language constraint for all supported locales.
- [ ] T010 [quality] Review all acceptance criteria, screen sizes, all locales, keyboard states, customer-facing copy, and production build; update evidence.

## Completion evidence
- Commands/checks: `tsc --noEmit` passes; all six locale JSON resources have matching keys and interpolation placeholders.
- Acceptance criteria satisfied: implementation tasks T001–T008 are in place; T009 migration is authored but application to local/hosted databases has not been verified.
- Known limitations: browser visual review and production build remain pending; FAQ content is a summarized local research collection, not a complete validated question-and-answer corpus for RAG.
