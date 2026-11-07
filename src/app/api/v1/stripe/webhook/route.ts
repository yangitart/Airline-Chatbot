import { NextRequest } from "next/server";
import type Stripe from "stripe";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/src/core/api/stripe/server";
import { isLeft } from "fp-ts/Either";
import { createServerDemoPaymentWebhook } from "@/src/features/bookings/ioc/serverDemoPaymentWebhook";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";

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

  const relevant = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ];
  if (!relevant.includes(event.type)) return jsonResponse({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  if (
    session.mode !== "payment" ||
    session.metadata?.demo !== "true" ||
    !session.metadata.booking_id
  ) {
    return jsonResponse({ received: true });
  }
  const paymentStatus = [
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ].includes(event.type)
    ? "failed"
    : session.payment_status === "paid"
      ? "paid"
      : "failed";
  if (event.type === "checkout.session.completed" && paymentStatus !== "paid")
    return jsonResponse({ received: true });
  try {
    const result = await createServerDemoPaymentWebhook().execute({
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      paymentStatus,
    });
    if (isLeft(result)) throw new Error(result.left);
    return jsonResponse({ received: true });
  } catch {
    return jsonError("Payment event could not be recorded.", 500);
  }
}
