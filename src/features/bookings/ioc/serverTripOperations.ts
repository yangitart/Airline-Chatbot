import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseTripOperationsDataSource } from "../data/data_sources/SupabaseTripOperationsDataSource";
import { BookingTripOperationsRepositoryImpl } from "../data/repositories/BookingTripOperationsRepositoryImpl";
import {
  checkInDemoBookingUseCase,
  getCheckoutBookingUseCase,
  saveCheckoutSessionUseCase,
} from "../domain/useCases/bookingTripOperationsUseCases";

export function createServerTripOperations(supabase: SupabaseClient) {
  const repository = BookingTripOperationsRepositoryImpl(
    createSupabaseTripOperationsDataSource(supabase),
  );
  return {
    getCheckoutBooking: getCheckoutBookingUseCase(repository),
    saveCheckoutSession: saveCheckoutSessionUseCase(repository),
    checkInDemoBooking: checkInDemoBookingUseCase(repository),
  };
}
