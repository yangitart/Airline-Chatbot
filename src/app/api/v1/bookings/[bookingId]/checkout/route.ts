import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { createSupabaseAdminClient } from "@/src/core/api/supabase/admin";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { getStripeClient } from "@/src/core/api/stripe/server";
import { isLeft } from "fp-ts/Either";
import { createServerTripOperations } from "@/src/features/bookings/ioc/serverTripOperations";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user)
    return jsonError("Sign in to pay for this booking.", 401, "auth_required");

  const operations = createServerTripOperations(supabase);
  const bookingResult = await operations.getCheckoutBooking.execute({
    bookingId,
    userId: user.id,
  });
  if (isLeft(bookingResult))
    return jsonError(
      "Booking could not be loaded.",
      500,
      "booking_load_failed",
    );
  const booking = bookingResult.right;
  if (!booking)
    return jsonError("Booking not found.", 404, "booking_not_found");
  if (
    !booking.is_demo ||
    booking.payment_status === "paid" ||
    !["demo_saved", "pending_payment", "failed"].includes(booking.status)
  ) {
    return jsonError(
      "This booking cannot be paid.",
      409,
      "booking_not_payable",
    );
  }

  try {
    const stripe = getStripeClient();
    if (
      booking.payment_status === "checkout_pending" &&
      booking.stripe_checkout_session_id
    ) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        booking.stripe_checkout_session_id,
      );
      if (
        existingSession.livemode ||
        existingSession.mode !== "payment" ||
        existingSession.metadata?.demo !== "true" ||
        existingSession.metadata.booking_id !== booking.id ||
        existingSession.client_reference_id !== booking.id ||
        existingSession.amount_total !== booking.total_fare_minor ||
        existingSession.currency !== booking.currency.toLowerCase()
      ) {
        return jsonError(
          "Checkout could not be verified.",
          409,
          "checkout_unavailable",
        );
      }
      if (existingSession.status === "open" && existingSession.url)
        return jsonResponse({ checkout_url: existingSession.url });
      if (existingSession.status === "expired")
        return jsonError(
          "This checkout expired. Search again to choose another flight.",
          409,
          "checkout_expired",
        );
      return jsonError(
        "Payment is being verified. Refresh your trips shortly.",
        409,
        "payment_verifying",
      );
    }
    const { saveCheckoutSession } = createServerTripOperations(
      supabase,
      createSupabaseAdminClient(),
    );
    const siteUrl = _request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ...(booking.currency === "USD"
          ? { adaptive_pricing: { enabled: false } }
          : {}),
        client_reference_id: booking.id,
        metadata: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          demo: "true",
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: booking.currency.toLowerCase(),
              unit_amount: booking.total_fare_minor,
              product_data: {
                name: `Flight booking ${booking.booking_reference.replace(/^DEMO-/i, "AI-")}`,
                description: "Flight itinerary booking",
              },
            },
          },
        ],
        success_url: `${siteUrl}/my-trips?payment=return&booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/my-trips?payment=cancelled`,
      },
      {
        idempotencyKey: `demo-checkout:${booking.id}:${booking.stripe_checkout_session_id ?? "initial"}`,
      },
    );
    if (session.status !== "open" || !session.url) {
      return jsonError(
        "Checkout is no longer available.",
        409,
        "checkout_unavailable",
      );
    }
    const saveResult = await saveCheckoutSession.execute({
      bookingId: booking.id,
      userId: user.id,
      sessionId: session.id,
    });
    if (isLeft(saveResult) && saveResult.left.includes("booking_not_payable")) {
      return jsonError(
        "This booking cannot be paid.",
        409,
        "booking_not_payable",
      );
    }
    if (isLeft(saveResult))
      return jsonError(
        "Checkout could not be prepared.",
        500,
        "checkout_unavailable",
      );
    return jsonResponse({ checkout_url: session.url });
  } catch (cause) {
    const notConfigured =
      cause instanceof Error && cause.message.includes("not configured");
    const detail = notConfigured
      ? "Payments are currently unavailable. Configure the payment service and webhook."
      : "Payment checkout is temporarily unavailable.";
    return jsonError(
      detail,
      503,
      notConfigured ? "stripe_not_configured" : "checkout_unavailable",
    );
  }
}
