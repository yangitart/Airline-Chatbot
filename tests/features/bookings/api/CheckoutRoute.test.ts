import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/src/app/api/v1/bookings/[bookingId]/checkout/route";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(), get: vi.fn(), save: vi.fn(), create: vi.fn(), expire: vi.fn(),
}));
vi.mock("@/src/core/api/supabase/authenticatedRequest", () => ({ createAuthenticatedSupabaseContext: mocks.authenticate }));
vi.mock("@/src/core/api/supabase/admin", () => ({ createSupabaseAdminClient: () => ({}) }));
vi.mock("@/src/core/api/stripe/server", () => ({ getStripeClient: () => ({ checkout: { sessions: { create: mocks.create, expire: mocks.expire } } }) }));
vi.mock("@/src/features/bookings/ioc/serverTripOperations", () => ({ createServerTripOperations: () => ({ getCheckoutBooking: { execute: mocks.get }, saveCheckoutSession: { execute: mocks.save } }) }));
const booking = {
  id: "booking", user_id: "owner", is_demo: true, status: "demo_saved", payment_status: "unpaid",
  booking_reference: "DEMO-ABC", total_fare_minor: 100, currency: "USD",
  stripe_checkout_session_id: null, hold_expires_at: new Date(Date.now() + 60_000).toISOString(),
};
function checkout() {
  return POST(new NextRequest("http://localhost/api/v1/bookings/booking/checkout", { method: "POST" }), { params: Promise.resolve({ bookingId: booking.id }) });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.authenticate.mockResolvedValue({ supabase: {}, user: { id: "owner" } });
  mocks.get.mockResolvedValue({ _tag: "Right", right: booking });
  mocks.save.mockResolvedValue({ _tag: "Right", right: undefined });
  mocks.create.mockResolvedValue({ id: "cs_test_New", status: "open", url: "https://checkout.stripe.com/test" });
  mocks.expire.mockResolvedValue({});
});
it("rejects an elapsed hold before creating a Stripe session, even before the sweep runs", async () => {
  mocks.get.mockResolvedValue({ _tag: "Right", right: { ...booking, hold_expires_at: new Date(Date.now() - 1000).toISOString() } });
  const response = await checkout();
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ error_code: "checkout_expired" });
  expect(mocks.create).not.toHaveBeenCalled();
});
it("expires a new Stripe session when the database refuses to link it", async () => {
  mocks.save.mockResolvedValue({ _tag: "Left", left: "booking_not_payable" });
  const response = await checkout();
  expect(response.status).toBe(409);
  expect(mocks.expire).toHaveBeenCalledWith("cs_test_New");
  expect(await response.json()).not.toHaveProperty("checkout_url");
});
it("keeps the rejected session URL private even if Stripe cleanup fails", async () => {
  mocks.save.mockResolvedValue({ _tag: "Left", left: "write_failed" });
  mocks.expire.mockRejectedValue(new Error("dependency unavailable"));
  const response = await checkout();
  expect(response.status).toBe(500);
  expect(await response.json()).not.toHaveProperty("checkout_url");
});
it("returns Checkout only after successfully linking the active hold", async () => {
  const response = await checkout();
  expect(response.status).toBe(200);
  expect(mocks.save).toHaveBeenCalledWith({ bookingId: booking.id, userId: "owner", sessionId: "cs_test_New" });
  expect(await response.json()).toEqual({ checkout_url: "https://checkout.stripe.com/test" });
  expect(mocks.expire).not.toHaveBeenCalled();
});
