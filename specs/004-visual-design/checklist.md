# Checklist: visual design polish

**Spec:** spec.md  
**Status:** In progress

## Product clarity
- [x] The active views and visual goal are identified.
- [x] Existing behavior and the displayed booking/payment/check-in states remain consistent.
- [x] Scope excludes backend work, AI/RAG, and 3D visualizations.
- [x] Warm premium palette and type choices are applied as the working direction; the user can adjust them after reviewing the interface.

## Design system and implementation
- [x] Shared tokens and component patterns are planned.
- [x] Tailwind responsive utilities and existing Formik controls are the default.
- [x] Global CSS and legacy component cleanup are bounded by consumer checks.
- [x] Removed unused Tailwind palette entries and root layout variables after repository-wide searches found no consumers.
- [x] The existing airport image and fonts are the first asset choices.

## User experience
- [x] Search, trips, profile, status, auth, and state variants are listed.
- [x] English, Spanish, Hindi, French, Brazilian Portuguese, Simplified Chinese, keyboard use, focus, contrast, and reduced motion are covered.
- [x] Mobile and desktop layout evidence is part of acceptance.
- [x] Booking, payment, check-in, and guest/auth states remain clear in customer-facing copy, without visible prototype/demo labels.
- [x] Where We Fly, Prepare to Travel, and Air India Experience each have a working page and route-search entry point.

## Readiness
- [x] Spec, plan, checklist, and tasks are present.
- [x] User requests a warm premium refresh with original, reduced-motion-aware animations.
- [x] Implementation tasks cover the existing views and the three requested navigation sections.
