import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseFlightStatusDataSource } from "../data/data_sources/SupabaseFlightStatusDataSource";
import { FlightStatusRepositoryImpl } from "../data/repositories/FlightStatusRepositoryImpl";
import { lookupFlightStatusUseCase } from "../domain/useCases/lookupFlightStatusUseCase";

export function createServerFlightStatus(supabase: SupabaseClient) {
  return lookupFlightStatusUseCase(
    FlightStatusRepositoryImpl(createSupabaseFlightStatusDataSource(supabase)),
  );
}
