# Google sign-in and public flight search

**Status:** Implemented; local Google sign-in was confirmed by the user.

## User outcome
Visitors land on the flight-search page and can search without signing in. They can use the modal's Sign in or Sign up option to authenticate with Google through Supabase Auth.

## Implemented requirements
- The root page composes a responsive flight-search feature view.
- Search works for anonymous visitors and validates airport codes and dates.
- The form collects trip type, airports, dates, passenger count, and cabin class.
- Search is handled by a versioned Next.js Route Handler, with domain/use-case/repository/data-source layers and Inversify composition.
- Demo flights are explicitly labeled as mock; selected passengers/cabin do not change the sample fare.
- Google OAuth uses Supabase Auth PKCE, the Next callback route, SSR cookies, and middleware session refresh.
- Supabase Auth stores the user record; the UI can load the current user and sign out.
- The interface supports English and Spanish through i18next.
- Supabase browser/server clients read the project URL and publishable key from environment variables.

## Verified evidence
- The user confirmed successful local Google sign-in.
- TypeScript typecheck and Next.js production build completed successfully.
