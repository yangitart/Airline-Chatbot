export type FlightStatusLookupQuery = { flightNumber: string; flightDate: string };

export type FlightStatusLookup = {
  flightNumber: string;
  flightDate: string;
  status: string;
  source: string;
  isDemo: boolean;
  updatedAt: string;
  payload: unknown;
  schedule: { originCode: string; destinationCode: string; departureAt: string; arrivalAt: string };
};
