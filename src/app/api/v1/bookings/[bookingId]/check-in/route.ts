import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { isLeft } from "fp-ts/Either";
import { createServerTripOperations } from "@/src/features/bookings/ioc/serverTripOperations";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in to check in.", 401, "auth_required");
  let body: { flight_leg?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return jsonError("Choose a flight leg.", 400, "flight_leg_required");
  }
  if (body?.flight_leg !== "outbound" && body?.flight_leg !== "return")
    return jsonError("Choose a valid flight leg.", 422, "invalid_flight_leg");
  const result = await createServerTripOperations(
    supabase,
  ).checkInDemoBooking.execute({ bookingId, flightLeg: body.flight_leg });
  if (isLeft(result)) {
    const message = result.left;
    if (message.includes("booking_not_found"))
      return jsonError("Booking not found.", 404, "booking_not_found");
    if (message.includes("payment_required"))
      return jsonError(
        "Complete payment before check-in.",
        409,
        "payment_required",
      );
    if (message.includes("booking_not_eligible"))
      return jsonError(
        "This booking is not eligible for check-in.",
        409,
        "booking_not_eligible",
      );
    if (message.includes("checkin_window_closed"))
      return jsonError(
        "Online check-in opens 48 hours before departure and closes 60 minutes before.",
        409,
        "checkin_window_closed",
      );
    if (message.includes("flight_leg_not_found"))
      return jsonError(
        "This booking has no return flight.",
        409,
        "flight_leg_not_found",
      );
    if (message.includes("flight_not_checkin_eligible"))
      return jsonError(
        "This flight is no longer eligible for check-in.",
        409,
        "flight_not_checkin_eligible",
      );
    return jsonError("Check-in could not be completed.", 500, "checkin_failed");
  }
  const data = result.right;
  return jsonResponse({
    checked_in: true,
    flight_leg: body.flight_leg,
    demo_seat: data.demo_seat,
    boarding_pass_reference: data.demo_boarding_pass_reference,
    checked_in_at: data.checked_in_at,
    is_demo: true,
  });
}
