# Implementation record: Google sign-in and flight search

## Runtime layout
- Next.js App Router is the application and API runtime.
- Supabase Auth manages Google OAuth, users, and cookie-backed sessions.
- Supabase Postgres is the application database; the current mock flight search does not read or write flight rows.

## Authentication flow
1. The feature modal starts Supabase Google OAuth using the browser Supabase client.
2. Supabase redirects to `/auth/callback`.
3. The callback exchanges the PKCE code for a session using the server Supabase client.
4. Middleware refreshes session cookies; the flight view loads the current Supabase user and can sign out.

## Flight-search flow
1. The Formik feature view calls its domain use case through Inversify.
2. The client repository/data source uses the core same-origin RestClient to call `/api/v1/flights/search`.
3. The Next Route Handler validates the query and composes the server-side search use case with the mock repository/data source.
4. Responses carry `is_mock` and a notice that schedules and prices are not live.

## Data ownership
Supabase Auth owns account identity in `auth.users`. There is no duplicate password/user table for this feature. Flight fixtures live in feature data code and are not inserted into the database.
