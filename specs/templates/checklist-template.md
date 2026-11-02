# Specification checklist: <feature name>

Spec: spec.md
Status: Draft / Ready

## Product clarity
- [ ] User and problem are specific.
- [ ] In-scope and out-of-scope behavior are clear.
- [ ] Acceptance criteria are observable and testable.
- [ ] Unknowns are written as open questions rather than assumptions.

## Data and integrations
- [ ] Sources of truth and mock data are identified.
- [ ] Next.js and Supabase responsibilities are explicit.
- [ ] Request/response or database contracts are defined where needed.
- [ ] External provider failure and timeout behavior are covered.

## Security and privacy
- [ ] Secrets remain server-side; publishable keys are distinguished from service-role keys.
- [ ] Supabase tables have RLS and policies defined before user data is exposed.
- [ ] Personal data collection, retention, and logging are minimized.

## User experience
- [ ] Empty, loading, success, and error states are covered where applicable.
- [ ] Controls are accessible by keyboard and have labels.
- [ ] Demo/mock status is obvious to users.

## Readiness
- [ ] Every requirement has an acceptance criterion.
- [ ] Spec does not claim a capability is already implemented.
- [ ] Plan and task breakdown do not contradict the spec or constitution.
