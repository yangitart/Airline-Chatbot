import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { isLeft } from "fp-ts/Either";
import { createServerTripOperations } from "@/src/features/bookings/ioc/serverTripOperations";

export async function POST(request: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Sign in to check in.", error_code: "auth_required" }, { status: 401 });
  let body: { flight_leg?: unknown } | null;
  try { body = await request.json(); } catch { return NextResponse.json({ detail: "Choose a flight leg.", error_code: "flight_leg_required" }, { status: 400 }); }
  if (body?.flight_leg !== "outbound" && body?.flight_leg !== "return") return NextResponse.json({ detail: "Choose a valid flight leg.", error_code: "invalid_flight_leg" }, { status: 422 });
  const result = await createServerTripOperations(supabase).checkInDemoBooking.execute({ bookingId, flightLeg: body.flight_leg });
  if (isLeft(result)) {
    const message = result.left;
    if (message.includes("booking_not_found")) return NextResponse.json({ detail: "Booking not found.", error_code: "booking_not_found" }, { status: 404 });
    if (message.includes("payment_required")) return NextResponse.json({ detail: "Complete payment before check-in.", error_code: "payment_required" }, { status: 409 });
    if (message.includes("booking_not_eligible")) return NextResponse.json({ detail: "This booking is not eligible for check-in.", error_code: "booking_not_eligible" }, { status: 409 });
    if (message.includes("checkin_window_closed")) return NextResponse.json({ detail: "Online check-in opens 48 hours before departure and closes 60 minutes before.", error_code: "checkin_window_closed" }, { status: 409 });
    if (message.includes("flight_leg_not_found")) return NextResponse.json({ detail: "This booking has no return flight.", error_code: "flight_leg_not_found" }, { status: 409 });
    if (message.includes("flight_not_checkin_eligible")) return NextResponse.json({ detail: "This flight is no longer eligible for check-in.", error_code: "flight_not_checkin_eligible" }, { status: 409 });
    return NextResponse.json({ detail: "Check-in could not be completed.", error_code: "checkin_failed" }, { status: 500 });
  }
  const data = result.right;
  return NextResponse.json({
    checked_in: true,
    flight_leg: body.flight_leg,
    demo_seat: data.demo_seat,
    boarding_pass_reference: data.demo_boarding_pass_reference,
    checked_in_at: data.checked_in_at,
    is_demo: true,
  });
}
