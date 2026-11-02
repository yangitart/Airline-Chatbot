# Spec-driven development workflow

Follow this sequence for each feature. The project constitution is established once; each feature then gets its own reviewed artifacts.

1. **Specify:** capture user problem, behavior, requirements, scope, examples, and acceptance criteria. Keep implementation choices out of the spec unless they are fixed project constraints.
2. **Research/clarify:** inspect referenced Air India pages, repository code, and data sources. Record facts with source URLs and review date. Ask about decisions that cannot be inferred; keep unknowns explicit.
3. **Plan:** choose the Next.js/Supabase implementation, data flow, API contracts, feature layers, security/RLS, failures, deployment settings, and verification approach.
4. **Checklist:** review requirement quality, source grounding, privacy/security, RLS, accessibility, error handling, and observability.
5. **Tasks:** break the plan into small ordered tasks. Each task should map to one or more spec/plan items.
6. **Analyze:** check spec, plan, checklist, tasks, and constitution for omissions and contradictions before coding.
7. **Implement:** work in vertical slices within the approved scope. Update artifacts if the user's requirements change.
8. **Converge:** verify acceptance criteria, update task status only with evidence, and record remaining limitations.

For straightforward changes, research, checklist, and analysis can be concise. For RAG, policy claims, auth, RLS, or external integrations, keep these quality gates explicit.

## Feature folder

- `specs/<id>-<feature>/spec.md`
- `specs/<id>-<feature>/plan.md`
- `specs/<id>-<feature>/checklist.md`
- `specs/<id>-<feature>/tasks.md`

Do not mark planned requirements as implemented. A task marked complete needs code evidence and relevant verification evidence.
