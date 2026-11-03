import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
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
    is_demo: true,
    itinerary_snapshot: booking.itinerarySnapshot,
    flight_order_payload: booking.flightOrderPayload,
    created_at: booking.createdAt,
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ detail: "Sign in to view this trip." }, { status: 401 });

  const { getMyBooking } = createServerBookings(supabase);
  const result = await getMyBooking.execute(bookingId);
  if (isLeft(result)) return NextResponse.json({ detail: "Trip details are temporarily unavailable." }, { status: 500 });
  if (!result.right) return NextResponse.json({ detail: "Trip not found." }, { status: 404 });
  return NextResponse.json(serializeBooking(result.right));
}
