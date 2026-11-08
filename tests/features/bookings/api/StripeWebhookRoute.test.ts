import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const stripe = vi.hoisted(() => ({
  constructEvent: vi.fn(),
}));
const webhook = vi.hoisted(() => ({
  execute: vi.fn(),
}));

vi.mock("@/src/core/api/stripe/server", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent: stripe.constructEvent },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

vi.mock("@/src/features/bookings/ioc/serverDemoPaymentWebhook", () => ({
  createServerDemoPaymentWebhook: () => ({ execute: webhook.execute }),
}));

import { POST } from "@/src/app/api/v1/stripe/webhook/route";

const bookingId = "10000000-0000-4000-8000-000000000001";

function checkoutEvent(
  overrides: Record<string, unknown> = {},
  livemode = false,
) {
  return {
    id: "evt_test_123",
    type: "checkout.session.completed",
    livemode,
    data: {
      object: {
        id: "cs_test_Session123",
        mode: "payment",
        livemode: false,
        client_reference_id: bookingId,
        metadata: { demo: "true", booking_id: bookingId },
        amount_total: 5353,
        currency: "usd",
        payment_status: "paid",
        payment_intent: "pi_test_123",
        ...overrides,
      },
    },
  };
}

function request() {
  return new Request("http://localhost/api/v1/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=signature" },
    body: "{}",
  }) as NextRequest;
}

beforeEach(() => {
  stripe.constructEvent.mockReturnValue(checkoutEvent());
  webhook.execute.mockResolvedValue({ _tag: "Right", right: true });
});

afterEach(() => vi.resetAllMocks());

it("rejects live events and mismatched booking references before applying payments", async () => {
  stripe.constructEvent.mockReturnValueOnce(checkoutEvent({}, true));
  const liveResponse = await POST(request());
  expect(liveResponse.status).toBe(200);
  expect(webhook.execute).not.toHaveBeenCalled();

  stripe.constructEvent.mockReturnValueOnce(
    checkoutEvent({
      client_reference_id: "10000000-0000-4000-8000-000000000002",
    }),
  );
  const mismatchedResponse = await POST(request());
  expect(mismatchedResponse.status).toBe(200);
  expect(webhook.execute).not.toHaveBeenCalled();
});

it("applies only a paid test session and sends its amount and currency for database verification", async () => {
  stripe.constructEvent.mockReturnValueOnce(
    checkoutEvent({ payment_status: "unpaid" }),
  );
  expect((await POST(request())).status).toBe(200);
  expect(webhook.execute).not.toHaveBeenCalled();

  stripe.constructEvent.mockReturnValueOnce(checkoutEvent());
  expect((await POST(request())).status).toBe(200);
  expect(webhook.execute).toHaveBeenCalledWith({
    eventId: "evt_test_123",
    eventType: "checkout.session.completed",
    sessionId: "cs_test_Session123",
    bookingId,
    amountTotal: 5353,
    currency: "USD",
    paymentIntentId: "pi_test_123",
  });
});

it("rejects requests without a Stripe signature", async () => {
  const response = await POST(
    new Request("http://localhost/api/v1/stripe/webhook", {
      method: "POST",
      body: "{}",
    }) as NextRequest,
  );
  expect(response.status).toBe(400);
  expect(webhook.execute).not.toHaveBeenCalled();
});
