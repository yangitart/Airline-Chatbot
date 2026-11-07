export const APP_ROUTES = {
  HOME: "/",
  GOOGLE_AUTH_CALLBACK: "/auth/callback",
} as const;

export const API_ROUTES = {
  FLIGHT_SEARCH: "/api/v1/flights/search",
  FEATURED_FLIGHTS: "/api/v1/flights/featured",
} as const;
