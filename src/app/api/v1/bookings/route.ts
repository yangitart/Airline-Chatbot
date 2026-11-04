import { isLeft } from "fp-ts/Either";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import type { CreateDemoBookingCommand } from "@/src/features/bookings/domain/models/Booking";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    demo_checkins: booking.checkIns.map((checkin) => ({ flight_leg: checkin.flightLeg, checked_in_at: checkin.checkedInAt, demo_seat: checkin.demoSeat, demo_boarding_pass_reference: checkin.boardingPassReference })),
    is_demo: true as const,
    itinerary_snapshot: booking.itinerarySnapshot,
    flight_order_payload: booking.flightOrderPayload,
    created_at: booking.createdAt,
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ detail: "Sign in to view your trips." }, { status: 401 });

  const { listMyBookings } = createServerBookings(supabase);
  const result = await listMyBookings.execute();
  if (isLeft(result)) return NextResponse.json({ detail: "Trips are temporarily unavailable." }, { status: 500 });
  return NextResponse.json(result.right.map(serializeBooking));
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ detail: "Sign in before saving a demo booking." }, { status: 401 });

  let body: { flight_instance_id?: unknown; return_flight_instance_id?: unknown; cabin_class?: unknown; passenger_count?: unknown; expected_outbound_fare_minor?: unknown; expected_return_fare_minor?: unknown; idempotency_key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? body.idempotency_key;
  const flightInstanceId = body.flight_instance_id;
  const returnFlightInstanceId = body.return_flight_instance_id ?? undefined;
  const cabinClass = body.cabin_class;
  const passengerCount = body.passenger_count;
  const expectedOutboundFareMinor = body.expected_outbound_fare_minor;
  const expectedReturnFareMinor = body.expected_return_fare_minor ?? undefined;
  if (typeof flightInstanceId !== "string" || !uuidPattern.test(flightInstanceId)
    || (returnFlightInstanceId !== undefined && (typeof returnFlightInstanceId !== "string" || !uuidPattern.test(returnFlightInstanceId)))
    || typeof cabinClass !== "string" || !["economy", "premium-economy", "business", "first"].includes(cabinClass)
    || typeof passengerCount !== "number" || !Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 9
    || typeof expectedOutboundFareMinor !== "number" || !Number.isInteger(expectedOutboundFareMinor) || expectedOutboundFareMinor < 1
    || (expectedReturnFareMinor !== undefined && (typeof expectedReturnFareMinor !== "number" || !Number.isInteger(expectedReturnFareMinor) || expectedReturnFareMinor < 1))
    || typeof idempotencyKey !== "string" || !uuidPattern.test(idempotencyKey)) {
    return NextResponse.json({ detail: "Choose a valid flight, cabin, passenger count, and booking request ID." }, { status: 422 });
  }

  const command: CreateDemoBookingCommand = {
    flightInstanceId,
    returnFlightInstanceId,
    cabinClass,
    passengerCount,
    expectedOutboundFareMinor,
    expectedReturnFareMinor,
    idempotencyKey,
  };
  const { createDemoBooking } = createServerBookings(supabase);
  const result = await createDemoBooking.execute(command);
  if (isLeft(result)) {
    const error = result.left;
    if (error.includes("inventory_changed")) {
      return NextResponse.json({ detail: "Availability changed. Search again before booking." }, { status: 409 });
    }
    if (error.includes("fare_changed")) {
      return NextResponse.json({ detail: "The fare changed. Review the current offer before booking." }, { status: 409 });
    }
    if (error.includes("flight_unavailable")) {
      return NextResponse.json({ detail: "That demo flight is no longer available." }, { status: 404 });
    }
    return NextResponse.json({ detail: "The demo booking could not be saved." }, { status: 500 });
  }

  return NextResponse.json(serializeBooking(result.right), { status: 201 });
}
