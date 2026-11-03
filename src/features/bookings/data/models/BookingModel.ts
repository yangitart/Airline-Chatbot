import type { Booking } from "../../domain/models/Booking";
import type { AmadeusFlightOrderModel } from "./AmadeusFlightOrderModel";

export type BookingModel = {
  id: string;
  booking_reference: string;
  flight_instance_id: string;
  return_flight_instance_id: string | null;
  cabin_class: string;
  passenger_count: number;
  total_fare_minor: number;
  currency: string;
  status: "demo_saved" | "pending_payment" | "confirmed" | "failed" | "expired" | "cancelled";
  is_demo: true;
  itinerary_snapshot: Booking["itinerarySnapshot"];
  flight_order_payload: AmadeusFlightOrderModel;
  created_at: string;
};
