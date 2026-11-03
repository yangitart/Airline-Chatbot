# Tasks: demo flight search and bookings

**Status:** Local booking flow and hosted search verified; hosted authenticated booking verification remains.

- [x] Add models, routes, and adapters for search and bookings.
- [x] Add migration, RLS policies, booking function, and API-shaped demo data.
- [x] Add flight selection, authentication, and trip history UI.
- [x] Apply migration and seed data to local and hosted Supabase.
- [x] Verify local search, stale-fare conflict, demo booking, idempotent retry, owner read, and cross-user denial.
- [x] Verify simultaneous attempts for the final seat against local Supabase; one request succeeds and the other receives `409`.
- [x] Fix the booking request field mapping and preserve Supabase error messages for safe conflict handling.
- [x] Verify that the hosted search API returns persisted demo offers.
- [ ] Verify the hosted booking flow with Google sign-in.

Evidence: `npm run typecheck` and `npm run build` pass. Local API checks: search `200`, stale fare `409`, booking `201`, retry returns the same booking, owner detail `200`, another user's detail `404`, and simultaneous last-seat requests return one `201` plus one `409`. Local migration/seed and hosted migration/seed completed. The hosted search API returns three outbound and three return demo offers. Local API booking checks used temporary test users; Google OAuth is not configured in the local Supabase stack.
