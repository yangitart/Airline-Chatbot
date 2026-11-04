import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { getStripeClient } from "@/src/core/api/stripe/server";
import { isLeft } from "fp-ts/Either";
import { createServerTripOperations } from "@/src/features/bookings/ioc/serverTripOperations";

export async function POST(_request: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Sign in to pay for this demo booking.", error_code: "auth_required" }, { status: 401 });

  const operations = createServerTripOperations(supabase);
  const bookingResult = await operations.getCheckoutBooking.execute({ bookingId, userId: user.id });
  if (isLeft(bookingResult)) return NextResponse.json({ detail: "Booking could not be loaded.", error_code: "booking_load_failed" }, { status: 500 });
  const booking = bookingResult.right;
  if (!booking) return NextResponse.json({ detail: "Booking not found.", error_code: "booking_not_found" }, { status: 404 });
  if (!booking.is_demo || booking.payment_status === "paid") return NextResponse.json({ detail: "This demo booking cannot be paid again.", error_code: "booking_not_payable" }, { status: 409 });

  try {
    const stripe = getStripeClient();
    if (booking.payment_status === "checkout_pending" && booking.stripe_checkout_session_id) {
      const existingSession = await stripe.checkout.sessions.retrieve(booking.stripe_checkout_session_id);
      if (existingSession.status === "open" && existingSession.url) return NextResponse.json({ checkout_url: existingSession.url });
      if (existingSession.status === "complete") return NextResponse.json({ detail: "Payment is being verified. Refresh your trips shortly.", error_code: "payment_verifying" }, { status: 409 });
    }
    const siteUrl = _request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: booking.id,
      metadata: { booking_id: booking.id, booking_reference: booking.booking_reference, demo: "true" },
      line_items: [{ quantity: 1, price_data: {
        currency: booking.currency.toLowerCase(), unit_amount: booking.total_fare_minor,
        product_data: { name: `Demo flight booking ${booking.booking_reference}`, description: "Test mode only · no airline ticket is issued" },
      } }],
      success_url: `${siteUrl}/my-trips?payment=return&booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/my-trips?payment=cancelled`,
    });
    const saveResult = await operations.saveCheckoutSession.execute({ bookingId: booking.id, sessionId: session.id });
    if (isLeft(saveResult)) return NextResponse.json({ detail: "Checkout could not be prepared.", error_code: "checkout_unavailable" }, { status: 500 });
    if (!session.url) return NextResponse.json({ detail: "Checkout could not be prepared.", error_code: "checkout_unavailable" }, { status: 500 });
    return NextResponse.json({ checkout_url: session.url });
  } catch (cause) {
    const notConfigured = cause instanceof Error && cause.message.includes("not configured");
    const detail = notConfigured ? "Demo payments are not configured yet. Add the Stripe test and webhook keys." : "Payment checkout is temporarily unavailable.";
    return NextResponse.json({ detail, error_code: notConfigured ? "stripe_not_configured" : "checkout_unavailable" }, { status: 503 });
  }
}
