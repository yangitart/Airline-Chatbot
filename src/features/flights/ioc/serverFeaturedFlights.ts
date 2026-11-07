import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getFeaturedFlightsUseCase } from "../domain/useCases/searchFlightsUseCase";
import { FlightSearchRepositoryImpl } from "../data/repositories/FlightSearchRepositoryImpl";
import { SupabaseFlightSearchDataSourceImpl } from "../data/data_sources/SupabaseFlightSearchDataSource";

export function createServerFeaturedFlights(supabase: SupabaseClient) {
  const dataSource = SupabaseFlightSearchDataSourceImpl(supabase);
  const repository = FlightSearchRepositoryImpl(dataSource);
  return getFeaturedFlightsUseCase(repository);
}
