import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { searchFlightsUseCase } from "../domain/useCases/searchFlightsUseCase";
import { FlightSearchRepositoryImpl } from "../data/repositories/FlightSearchRepositoryImpl";
import { SupabaseFlightSearchDataSourceImpl } from "../data/data_sources/SupabaseFlightSearchDataSource";

/** Compose database-backed search with the cookie-bound Supabase client for this request. */
export function createServerSearchFlights(supabase: SupabaseClient) {
  const dataSource = SupabaseFlightSearchDataSourceImpl(supabase);
  const repository = FlightSearchRepositoryImpl(dataSource);
  return searchFlightsUseCase(repository);
}
