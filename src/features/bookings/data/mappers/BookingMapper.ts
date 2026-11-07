import type { Booking } from "../../domain/models/Booking";
import type { BookingModel } from "../models/BookingModel";

export const mapBookingModel = (model: BookingModel): Booking => ({
  id: model.id,
  bookingReference: model.booking_reference,
  flightInstanceId: model.flight_instance_id,
  returnFlightInstanceId: model.return_flight_instance_id,
  cabinClass: model.cabin_class,
  passengerCount: model.passenger_count,
  totalFareMinor: model.total_fare_minor,
  currency: model.currency,
  status: model.status,
  paymentStatus: model.payment_status,
  checkIns: (model.demo_checkins ?? []).map((checkin) => ({
    flightLeg: checkin.flight_leg,
    checkedInAt: checkin.checked_in_at,
    demoSeat: checkin.demo_seat,
    boardingPassReference: checkin.demo_boarding_pass_reference,
  })),
  isDemo: true,
  itinerarySnapshot: model.itinerary_snapshot,
  flightOrderPayload: model.flight_order_payload,
  createdAt: model.created_at,
});
