import { isLeft } from "fp-ts/Either";
import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { serializeBooking } from "@/src/features/bookings/data/mappers/BookingMapper";
import {
  mapCreateBookingError,
  parseCreateBookingRequest,
} from "@/src/features/bookings/data/http/createBookingRequest";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const parsed = parseCreateBookingRequest(
    body,
    request.headers.get("Idempotency-Key"),
  );
  if (!parsed.ok) return jsonError(parsed.detail, parsed.status);

  const { createDemoBooking } = createServerBookings(supabase);
  const result = await createDemoBooking.execute(parsed.command);
  if (isLeft(result)) {
    const error = mapCreateBookingError(result.left);
    return jsonError(error.detail, error.status);
  }

  const booking = result.right;
  if (
    booking.flightInstanceId !== parsed.command.flightInstanceId.toLowerCase() ||
    booking.returnFlightInstanceId !==
      (parsed.command.returnFlightInstanceId?.toLowerCase() ?? null) ||
    booking.cabinClass !== parsed.command.cabinClass ||
    booking.passengerCount !== parsed.command.passengerCount ||
    booking.totalFareMinor !== parsed.expectedTotal
  ) {
    return jsonError(
      "This booking request already refers to a different itinerary or fare.",
      409,
    );
  }
  return jsonResponse(serializeBooking(booking), { status: 201 });
}
