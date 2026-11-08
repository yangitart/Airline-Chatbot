import { NextRequest } from "next/server";
import type Stripe from "stripe";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/src/core/api/stripe/server";
import { isLeft } from "fp-ts/Either";
import { createServerDemoPaymentWebhook } from "@/src/features/bookings/ioc/serverDemoPaymentWebhook";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { bookingUuidPattern } from "@/src/features/bookings/data/http/bookingRequestKey";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return jsonError("Missing Stripe signature.", 400);
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    return jsonError("Invalid Stripe signature.", 400);
  }

  if (
    event.livemode ||
    (event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded" &&
      event.type !== "checkout.session.async_payment_failed" &&
      event.type !== "checkout.session.expired")
  ) {
    return jsonResponse({ received: true });
  }
  const session = event.data.object;
  const bookingId = session.metadata?.booking_id;
  if (
    session.livemode ||
    session.mode !== "payment" ||
    session.metadata?.demo !== "true" ||
    !bookingId ||
    !bookingUuidPattern.test(bookingId) ||
    session.client_reference_id !== bookingId ||
    !/^cs_test_[A-Za-z0-9]+$/.test(session.id) ||
    session.amount_total === null ||
    !Number.isSafeInteger(session.amount_total) ||
    session.amount_total <= 0 ||
    !session.currency ||
    !/^[a-z]{3}$/.test(session.currency)
  ) {
    return jsonResponse({ received: true });
  }
  const isSuccess =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";
  if (isSuccess !== (session.payment_status === "paid"))
    return jsonResponse({ received: true });
  try {
    const result = await createServerDemoPaymentWebhook().execute({
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      bookingId,
      amountTotal: session.amount_total,
      currency: session.currency.toUpperCase(),
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    });
    if (isLeft(result)) throw new Error(result.left);
    return jsonResponse({ received: true });
  } catch {
    return jsonError("Payment event could not be recorded.", 500);
  }
}
