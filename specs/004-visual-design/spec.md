# 004: Visual design polish

**Status:** In progress  
**Owner:**  
**Last updated:** 2026-11-04

## Problem

The working travel experience has separate search, sign-in, results, trips, profile, and flight-status views, but their colors, spacing, control styles, and visual hierarchy are not yet consistent. Travelers should experience these sections as one polished, professional product on desktop and mobile.

## User stories

- As a traveler, I want each section to feel coherent and easy to scan so I can move through a journey without relearning the interface.
- As a traveler on a phone, I want forms, results, and trip actions to fit the screen and remain comfortable to use.
- As a traveler, I want account, payment, and check-in states to remain visually clear while the interface is refined.

## Outcomes and success measures

- The home/search, sign-in, results, My Trips, profile, and flight-status views share one design system.
- Existing functionality and current booking/payment/check-in state remain clear through the redesign.
- Layouts work at mobile, tablet, laptop, and wide desktop sizes without horizontal overflow or clipped controls.
- A desktop visitor sees the home hero and search card together without an unnecessary initial page scroll; result and account views may scroll naturally.

## Scope

### In scope

- A visual audit and a compact system for color, type, spacing, radii, borders, shadows, buttons, fields, cards, badges, and focus states.
- Shared app header, alert/banner, language selector, Google sign-in modal, and navigation tabs.
- Functional public destination, travel-preparation, and Air India experience pages linked from the main navigation.
- A searchable FAQ and travel-information section with locally rendered category and guide pages.
- Home hero, flight-search form, validation, public search results, and booking actions.
- My Trips booking cards, payment state/actions, per-leg check-in state/actions, and empty/loading/error states.
- Profile and flight-status forms, results, loading, and error states.
- Responsive refinement, keyboard focus, contrast, and consistent English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese presentation.
- Tailwind utilities and reusable shared form primitives; keep global CSS limited to base/reset/font rules and tokens that cannot live in Tailwind config.

### Out of scope

- Changes to Supabase schema, RLS, API contracts, authentication, booking, payment, or check-in behavior.
- AI chat, policy ingestion, embeddings, and RAG.
- Three.js, 3D scenes, or animation-heavy visual effects.
- Live airline data, new integrations, or claims that mock state is confirmed by an airline system.

## Visual direction

- Refine the existing warm, premium travel mood: ivory/stone surfaces, deep ink or evergreen structure, and restrained garnet and muted-gold accents.
- Use a clear editorial type hierarchy, generous but controlled spacing, calm card surfaces, and consistent interactive states.
- Keep airport imagery as atmosphere behind readable content; maintain accessible contrast with overlays where needed.
- Do not shift to a monochrome black-and-white direction or copy another airline site's layout pixel-for-pixel.
- Add an original 2D journey motif: a dotted flight path with a gently gliding aircraft in the hero, staggered hero/search entrances, and light card/modal transitions.
- Motion should clarify hierarchy and interaction, stay low-amplitude, and honor reduced-motion preferences; avoid endlessly moving content or animation-heavy effects.

## Functional requirements

- **FR-001:** All active traveler views use shared visual tokens and compatible control, card, badge, and button patterns.
- **FR-002:** The home view keeps its flight-search form prominent and usable at desktop and mobile sizes.
- **FR-003:** Search, validation, results, authentication, booking, payment, check-in, profile, and status behavior remain unchanged while styling is refactored.
- **FR-004:** Guest and authenticated states remain visually distinct; private actions still open sign-in for guests.
- **FR-005:** Customer-facing copy uses realistic travel-service language without repetitive prototype/demo notices; status and action messages remain accurate to the app state.
- **FR-006:** Loading, empty, validation, success, and error states receive the same visual treatment across sections.
- **FR-007:** The interface remains localized in English, Spanish, Hindi, French, Brazilian Portuguese, and Simplified Chinese without adding hard-coded copy.
- **FR-008:** Use Tailwind responsive utilities and existing shared form components; do not add media-query rules for page responsiveness.
- **FR-009:** Remove obsolete visual classes/tokens only after confirming they have no remaining consumers.
- **FR-010:** “Where we fly,” “Prepare to travel,” and “Air India experience” open useful pages; each page has working internal/external links and a consistent site header.
- **FR-011:** The language control opens a compact card with flags, language names, a selected state, outside-click/Escape handling, and persistent selection for all six supported languages.
- **FR-012:** The main navigation and travel-preparation page link to a searchable, locally rendered FAQ category index; each topic opens a wiki-style page with in-topic search, locally stored summary content, and its section outline. The UI does not send travelers to external FAQ pages.

## Non-functional requirements

- **Accessibility:** Semantic landmarks and headings, keyboard-operable navigation/forms, visible focus, labels, errors, sufficient text contrast, and reduced-motion support.
- **Responsive behavior:** Review at widths around 360, 768, 1024, and 1440 pixels; prevent horizontal scrolling and ensure controls remain tappable.
- **Performance:** Reuse existing assets and dependencies; optimize image sizing and avoid new heavy UI/animation libraries.
- **Motion:** Prefer transform/opacity animations, avoid layout-thrashing properties, and disable nonessential motion when the user requests reduced motion.
- **Maintainability:** Keep feature-specific presentation in each feature UI; put genuinely reusable elements in `src/components`; keep global CSS small.

## Data and integrations

- Source of truth and API behavior remain unchanged from specs 001–003.
- Existing seeded flight, booking, payment, status, and check-in values remain unchanged; the visual refresh does not imply a new backend integration.
- Reuse the existing airport-terminal image and loaded fonts; any new assets must fit the approved direction and be locally optimized.

## API contract

No API or database changes are included in this visual spec.

## Acceptance criteria

- [ ] Header, navigation, language selector, and Google sign-in modal have consistent hierarchy and responsive behavior.
- [ ] All three informational navigation items open their intended pages on desktop and mobile; destination cards prefill the existing flight search.
- [ ] FAQ topics are searchable and open local category articles with in-topic search, a return link to all topics, and locally stored summaries/section outlines; traveler-facing FAQ pages contain no external source links.
- [ ] The language picker opens its flag card, marks the active language, changes locale, and closes by selection, outside click, or Escape.
- [ ] Home hero includes the original 2D flight-path motif, staggered text entrance, and a search-card arrival that respect reduced motion.
- [ ] The hero and search card feel like one composition; the desktop first view avoids unnecessary scroll, while mobile remains readable and operable.
- [ ] Search controls, validation messages, result cards, fare display, and booking actions share consistent spacing and interaction states.
- [ ] My Trips presents each itinerary leg, fare, payment state, check-in state, and available action in a clear responsive card layout.
- [ ] The interface avoids visible prototype/demo labels and uses neutral booking, payment, check-in, and flight-status language.
- [ ] Profile and flight-status views match the app system and expose all input, result, loading, empty, and error states clearly.
- [ ] All six supported locales remain complete, persist across reloads, and set the document language correctly; profile language preference accepts the same set.
- [ ] Keyboard focus, semantic structure, contrast, reduced motion, and target viewport widths meet the requirements above.
- [ ] Motion uses lightweight 2D CSS/Tailwind animation only; no Three.js or large visual dependency is added, and global CSS does not accumulate page styling or responsive media queries.
- [ ] A production build passes and a visual review covers each listed view at representative screen sizes.

## Risks and open questions

- Confirm the exact production brand colors and type scale before detailed implementation; this draft proposes a warm premium direction based on the current interface.
- The home view has substantial existing content; fitting the hero and search card at shorter heights may need controlled copy/spacing choices.
- Legacy HeroUI styles and inherited components may affect shared controls; remove them only after checking actual consumers.
