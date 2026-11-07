import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDemoBookingCommand } from "../../domain/models/Booking";
import { parseBookingLookup } from "../../domain/models/BookingReference";
import type { BookingDataSource } from "./BookingDataSource";
import type { BookingModel } from "../models/BookingModel";

export const SupabaseBookingDataSourceImpl = (
  supabase: SupabaseClient,
): BookingDataSource => ({
  createDemoBooking: async (command: CreateDemoBookingCommand) => {
    const { data, error } = await supabase.rpc("create_demo_booking", {
      p_flight_instance_id: command.flightInstanceId,
      p_return_flight_instance_id: command.returnFlightInstanceId ?? null,
      p_cabin_class: command.cabinClass,
      p_passenger_count: command.passengerCount,
      p_expected_outbound_fare_minor: command.expectedOutboundFareMinor,
      p_expected_return_fare_minor: command.expectedReturnFareMinor ?? null,
      p_idempotency_key: command.idempotencyKey,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("booking_create_failed");
    return row as BookingModel;
  },
  listMyBookings: async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,booking_reference,flight_instance_id,return_flight_instance_id,cabin_class,passenger_count,total_fare_minor,currency,status,payment_status,is_demo,itinerary_snapshot,flight_order_payload,created_at,demo_checkins(flight_leg,checked_in_at,demo_seat,demo_boarding_pass_reference)",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as unknown as BookingModel[];
  },
  getMyBooking: async (id) => {
    const lookup = parseBookingLookup(id);
    if (!lookup) return null;
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,booking_reference,flight_instance_id,return_flight_instance_id,cabin_class,passenger_count,total_fare_minor,currency,status,payment_status,is_demo,itinerary_snapshot,flight_order_payload,created_at,demo_checkins(flight_leg,checked_in_at,demo_seat,demo_boarding_pass_reference)",
      )
      .eq(lookup.column, lookup.value)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as unknown as BookingModel | null;
  },
});
