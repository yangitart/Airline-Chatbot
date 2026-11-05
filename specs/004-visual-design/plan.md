# Plan: visual design polish

**Spec:** spec.md  
**Status:** In progress

## Design

Refine the current Next.js feature views in place, keeping their data flow, use cases, and behavior intact. First agree on a compact palette, typography, spacing, and component vocabulary from the visual direction in the spec. Apply shared visual patterns to navigation, Formik controls, buttons, badges, alerts, and cards, then update each feature view in a reviewable sequence. Keep feature-specific layout in `src/features/<feature>/ui`; move an element to `src/components` only when multiple features reuse it.

Use Tailwind utilities and existing Formik adapters for page layout and state. Keep `src/globals.css` for base styles, font loading, and small global tokens only. Reuse the current hero image and fonts. Do not change API calls, auth gates, booking/payment/check-in state, or data labels.

## Files and components

| Area | Planned change |
|---|---|
| Shared frontend | `src/components/forms`, shared button/alert primitives if reuse is real, and a compact token set in Tailwind config |
| Home/search | `src/features/flights/ui/views/FlightSearchView.tsx`, `FlightsHeader`, `BookingTabs`, `FlightHero`, `FlightSearchForm`, `FlightResults`, and query-prefilled routes |
| Authentication | `src/features/authentication/ui/components/GoogleAuthModal.tsx` |
| Trips | `src/features/bookings/ui/views/MyTripsView.tsx` |
| Profile/status | `src/features/users/ui/views/TravelProfileView.tsx` and `src/features/flights/ui/views/FlightStatusView.tsx` |
| Navigation pages | `src/features/flights/ui/views/WhereWeFlyView.tsx`, `src/features/travel-info/ui/views/PrepareToTravelView.tsx`, `src/features/experience/ui/views/AirIndiaExperienceView.tsx`, and shared `TravelSectionLayout` |
| Global/documentation | `src/globals.css`, Tailwind configuration, screenshots/review notes, and active spec evidence |

## Data flow

No data-flow changes. Existing UI views continue to call their current use cases and APIs. Refactor presentation in place and preserve current form values, validation, loading states, error mapping, routes, sign-in gates, and actions.

## Failure handling

Preserve existing loading, empty, validation, success, and error behavior. Styling changes must not hide, truncate, or make these messages inaccessible. If a long localized label does not fit, allow wrapping or a responsive layout change.

## Security and privacy

No new data collection or external requests. Keep credentials and user data out of UI copy, logs, screenshots, and checked-in design artifacts. Continue labeling demo records and payment states accurately.

## Verification

- Review the six view groups listed in the spec at mobile, tablet, laptop, and wide desktop widths.
- Check keyboard tab order, visible focus, labels, screen-reader landmarks, and contrast for core controls/states.
- Confirm the desktop home composition and mobile layout do not have horizontal overflow.
- Run the production build after the visual changes and inspect the changed pages in the browser when the implementation phase begins.

## Risks and rollout

Inventory existing consumers of shared components and legacy styles before removing anything. Work section by section so the 002/003 flows remain testable. Do not redesign views that are not part of the active traveler journey without adding them to an approved scope.
