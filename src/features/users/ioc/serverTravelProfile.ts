import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseTravelProfileDataSource } from "../data/data_sources/SupabaseTravelProfileDataSource";
import { TravelProfileRepositoryImpl } from "../data/repositories/TravelProfileRepositoryImpl";
import { getTravelProfileUseCase, updateTravelProfileUseCase } from "../domain/useCases/travelProfileUseCases";

export function createServerTravelProfile(supabase: SupabaseClient) {
  const repository = TravelProfileRepositoryImpl(createSupabaseTravelProfileDataSource(supabase));
  return { get: getTravelProfileUseCase(repository), update: updateTravelProfileUseCase(repository) };
}
