import type { DemoAirportCode } from "./DemoRoutes";

export type FeaturedFlight = {
  origin: DemoAirportCode;
  destination: DemoAirportCode;
  date: string;
  number: string;
};
