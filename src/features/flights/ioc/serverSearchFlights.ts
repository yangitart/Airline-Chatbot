import "server-only";

import { searchFlightsUseCase } from "../domain/useCases/searchFlightsUseCase";
import { FlightSearchRepositoryImpl } from "../data/repositories/FlightSearchRepositoryImpl";
import { MockFlightSearchDataSource } from "../data/data_sources/MockFlightSearchDataSource";

/** Build the server adapter per request. Replace the mock source with a
 * Supabase/provider adapter when flight data becomes persistent or live. */
export function createServerSearchFlights() {
  const repository = FlightSearchRepositoryImpl(MockFlightSearchDataSource);
  return searchFlightsUseCase(repository);
}
