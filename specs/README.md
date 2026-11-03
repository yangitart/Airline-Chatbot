# Specs

Use the spec-driven workflow for every user-facing feature.

## Start here
1. Read vision.md and constitution.md.
2. Copy templates/spec-template.md to a feature folder as spec.md.
3. Agree on user stories, boundaries, API contract, data sources, failure behavior, and acceptance criteria.
4. Write plan.md, checklist.md, and tasks.md from their templates where they apply.
5. Implement only tasks covered by the approved spec; update the documents as scope changes.

## Layout
- vision.md: product outcomes and exercise scope.
- constitution.md: durable engineering and product principles.
- workflow.md: change process.
- templates/: reusable spec, plan, checklist, and task documents.
- <feature>/: approved feature-specific spec, plan, checklist, and tasks.

A specification describes intended behavior. It does not mean the feature has been implemented.

## Product sequence

See [roadmap.md](roadmap.md) for the proposed service stages and their provider/data prerequisites.

1. `001-google-auth-flight-search` — implemented as the initial UI/auth slice.
2. `002-database-flight-booking` — local booking flow and hosted search verified; hosted authenticated booking confirmation remains before closing the spec.
3. Manage trips, journey operations, travel information/chat, and optional partner services — future capabilities; each needs its own reviewed feature spec.
4. Three.js visual refinement — a later presentation spec after core travel journeys work; it must provide accessible and mobile fallbacks and own no booking logic.
