import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { isLeft } from "fp-ts/Either";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";

function serializeBooking(booking: Booking) {
  return {
    id: booking.id,
    booking_reference: booking.bookingReference,
    flight_instance_id: booking.flightInstanceId,
    return_flight_instance_id: booking.returnFlightInstanceId,
    cabin_class: booking.cabinClass,
    passenger_count: booking.passengerCount,
    total_fare_minor: booking.totalFareMinor,
    currency: booking.currency,
    status: booking.status,
    payment_status: booking.paymentStatus,
    demo_checkins: booking.checkIns.map((checkin) => ({
      flight_leg: checkin.flightLeg,
      checked_in_at: checkin.checkedInAt,
      demo_seat: checkin.demoSeat,
      demo_boarding_pass_reference: checkin.boardingPassReference,
    })),
    is_demo: true,
    itinerary_snapshot: booking.itinerarySnapshot,
    flight_order_payload: booking.flightOrderPayload,
    created_at: booking.createdAt,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in to view this trip.", 401);

  const { getMyBooking } = createServerBookings(supabase);
  const result = await getMyBooking.execute(bookingId);
  if (isLeft(result))
    return jsonError("Trip details are temporarily unavailable.", 500);
  if (!result.right) return jsonError("Trip not found.", 404);
  return jsonResponse(serializeBooking(result.right));
}
