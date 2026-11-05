# 002: Demo flight search and bookings

**Status:** In progress. Local booking flow and hosted search are verified; the hosted authenticated booking flow remains to be checked.

The platform searches invented flights stored in Supabase, lets a traveler select outbound and return flights, saves a demo booking under a Google-authenticated account, and shows saved trips. Offers, orders, and status records use payload shapes modeled on Amadeus and AviationStack.

## Features

- Search by airports, dates, passenger count, and cabin; show the database price and availability.
- Select flights and save a demo booking linked to the authenticated user.
- List the user's trips and prevent access to another user's bookings.
- Recheck availability and save the booking in a transaction with an idempotency key.
- Clearly label flights and bookings as demos; no charge or real ticket is issued.

## Remaining work

- Verify the hosted booking flow with Google sign-in and the remote database.
- Fix any issues and update the task evidence.

Visual design refinements continue under [004-visual-design](../004-visual-design/spec.md).
