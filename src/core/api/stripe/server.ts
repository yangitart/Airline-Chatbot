import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith("sk_test_"))
    throw new Error("Stripe test mode is not configured.");
  stripeClient ??= new Stripe(secret);
  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith("whsec_"))
    throw new Error("Stripe webhook is not configured.");
  return secret;
}
