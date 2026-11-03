# Plan: demo flight search and bookings

The UI calls use cases in the flights and bookings features. Client adapters call Next.js Route Handlers; handlers validate requests and compose server repositories with a Supabase client bound to the current session.

Supabase stores airports, flights, availability, offers, and bookings. An SQL function verifies identity and reserves seats in a transaction. Offers and orders use payload structures modeled on Amadeus; flight status snapshots use AviationStack's nested structure. All records are invented demo data.

Before closing this spec, apply the migration and seed, verify RLS and the complete flow, and check price changes and retries. Setup instructions are in the root README.
