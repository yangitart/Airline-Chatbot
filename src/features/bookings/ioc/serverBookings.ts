import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { BookingRepositoryImpl } from "../data/repositories/BookingRepositoryImpl";
import { SupabaseBookingDataSourceImpl } from "../data/data_sources/SupabaseBookingDataSource";
import { createDemoBookingUseCase } from "../domain/useCases/createDemoBookingUseCase";
import { listMyBookingsUseCase } from "../domain/useCases/listMyBookingsUseCase";
import { getMyBookingUseCase } from "../domain/useCases/getMyBookingUseCase";

export function createServerBookings(supabase: SupabaseClient) {
  const dataSource = SupabaseBookingDataSourceImpl(supabase);
  const repository = BookingRepositoryImpl(dataSource);
  return {
    createDemoBooking: createDemoBookingUseCase(repository),
    listMyBookings: listMyBookingsUseCase(repository),
    getMyBooking: getMyBookingUseCase(repository),
  };
}
