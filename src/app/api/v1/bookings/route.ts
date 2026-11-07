import { isLeft } from "fp-ts/Either";
import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import type { CreateDemoBookingCommand } from "@/src/features/bookings/domain/models/Booking";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import {
  bookingUuidPattern,
  resolveBookingRequestKey,
} from "@/src/features/bookings/data/http/bookingRequestKey";

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
    is_demo: true as const,
    itinerary_snapshot: booking.itinerarySnapshot,
    flight_order_payload: booking.flightOrderPayload,
    created_at: booking.createdAt,
  };
}

export async function GET() {
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in to view your trips.", 401);

  const { listMyBookings } = createServerBookings(supabase);
  const result = await listMyBookings.execute();
  if (isLeft(result))
    return jsonError("Trips are temporarily unavailable.", 500);
  return jsonResponse(result.right.map(serializeBooking));
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in before saving your booking.", 401);

  let body: {
    flight_instance_id?: unknown;
    return_flight_instance_id?: unknown;
    cabin_class?: unknown;
    passenger_count?: unknown;
    expected_outbound_fare_minor?: unknown;
    expected_return_fare_minor?: unknown;
    idempotency_key?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  if (!body || typeof body !== "object")
    return jsonError("Invalid request body.", 400);
  const requestKey =
    request.headers.get("Idempotency-Key") ?? body.idempotency_key;
  const flightInstanceId = body.flight_instance_id;
  const returnFlightInstanceId = body.return_flight_instance_id ?? undefined;
  const cabinClass = body.cabin_class;
  const passengerCount = body.passenger_count;
  const expectedOutboundFareMinor = body.expected_outbound_fare_minor;
  const expectedReturnFareMinor = body.expected_return_fare_minor ?? undefined;
  if (
    typeof flightInstanceId !== "string" ||
    !bookingUuidPattern.test(flightInstanceId) ||
    (returnFlightInstanceId !== undefined &&
      (typeof returnFlightInstanceId !== "string" ||
        !bookingUuidPattern.test(returnFlightInstanceId))) ||
    typeof cabinClass !== "string" ||
    !["economy", "premium-economy", "business", "first"].includes(cabinClass) ||
    typeof passengerCount !== "number" ||
    !Number.isInteger(passengerCount) ||
    passengerCount < 1 ||
    passengerCount > 9 ||
    typeof expectedOutboundFareMinor !== "number" ||
    !Number.isInteger(expectedOutboundFareMinor) ||
    expectedOutboundFareMinor < 1 ||
    (expectedReturnFareMinor !== undefined &&
      (typeof expectedReturnFareMinor !== "number" ||
        !Number.isInteger(expectedReturnFareMinor) ||
        expectedReturnFareMinor < 1)) ||
    (returnFlightInstanceId === undefined) !==
      (expectedReturnFareMinor === undefined)
  ) {
    return jsonError(
      "Choose a valid flight, cabin, passenger count, and fare.",
      422,
    );
  }
  const idempotencyKey = resolveBookingRequestKey(
    requestKey,
    flightInstanceId,
    returnFlightInstanceId,
  );
  if (!idempotencyKey)
    return jsonError("Choose a valid booking request ID.", 422);

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
      return jsonError(
        "Availability changed. Search again before booking.",
        409,
      );
    }
    if (error.includes("fare_changed")) {
      return jsonError(
        "The fare changed. Review the current offer before booking.",
        409,
      );
    }
    if (error.includes("flight_unavailable")) {
      return jsonError("That flight is no longer available.", 404);
    }
    return jsonError("The booking could not be saved.", 500);
  }

  const booking = result.right;
  const expectedTotal =
    (expectedOutboundFareMinor + (expectedReturnFareMinor ?? 0)) *
    passengerCount;
  if (
    booking.flightInstanceId !== flightInstanceId.toLowerCase() ||
    booking.returnFlightInstanceId !==
      (returnFlightInstanceId?.toLowerCase() ?? null) ||
    booking.cabinClass !== cabinClass ||
    booking.passengerCount !== passengerCount ||
    booking.totalFareMinor !== expectedTotal
  ) {
    return jsonError(
      "This booking request already refers to a different itinerary or fare.",
      409,
    );
  }
  return jsonResponse(serializeBooking(booking), { status: 201 });
}
