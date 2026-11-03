export type CreateDemoBookingCommand = {
  flightInstanceId: string;
  returnFlightInstanceId?: string;
  cabinClass: string;
  passengerCount: number;
  expectedOutboundFareMinor: number;
  expectedReturnFareMinor?: number;
  idempotencyKey: string;
};

export type BookedOfferSnapshot = {
  id: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }>;
  }>;
};

export type Booking = {
  id: string;
  bookingReference: string;
  flightInstanceId: string;
  returnFlightInstanceId: string | null;
  cabinClass: string;
  passengerCount: number;
  totalFareMinor: number;
  currency: string;
  status: "demo_saved" | "pending_payment" | "confirmed" | "failed" | "expired" | "cancelled";
  isDemo: true;
  itinerarySnapshot: {
    outbound: BookedOfferSnapshot;
    return: BookedOfferSnapshot | null;
    cabin_class: string;
    passenger_count: number;
    currency: string;
    total_fare_minor: number;
    is_demo: true;
  };
  flightOrderPayload: unknown;
  createdAt: string;
};
import type { AmadeusFlightOrderModel } from "../../data/models/AmadeusFlightOrderModel";

