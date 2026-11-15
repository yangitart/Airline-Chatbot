import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "@/src/app/api/v1/bookings/[bookingId]/route";

const { authenticate, getCheckoutBooking } = vi.hoisted(() => ({
  authenticate: vi.fn(),
  getCheckoutBooking: vi.fn(),
}));

vi.mock("@/src/core/api/supabase/authenticatedRequest", () => ({
  createAuthenticatedSupabaseContext: authenticate,
}));
vi.mock("@/src/features/bookings/ioc/serverBookings", () => ({
  createServerBookings: () => {
    throw new Error("Payment lookup must not load the itinerary");
  },
}));
vi.mock("@/src/features/bookings/ioc/serverTripOperations", () => ({
  createServerTripOperations: () => ({
    getCheckoutBooking: { execute: getCheckoutBooking },
  }),
}));

const bookingId = "10000000-0000-4000-8000-000000000001";

function requestPayment() {
  return GET(
    new NextRequest(
      `http://localhost/api/v1/bookings/${bookingId}?fields=payment`,
    ),
    { params: Promise.resolve({ bookingId }) },
  );
}

beforeEach(() => {
  authenticate.mockReset();
  getCheckoutBooking.mockReset();
  authenticate.mockResolvedValue({ supabase: {}, user: { id: "owner" } });
});

it("returns only the owned booking's status and disables caching", async () => {
  getCheckoutBooking.mockResolvedValue({
    _tag: "Right",
    right: {
      status: "confirmed",
      payment_status: "paid",
      stripe_checkout_session_id: "private",
    },
  });
  const response = await requestPayment();
  expect(getCheckoutBooking).toHaveBeenCalledWith({
    bookingId,
    userId: "owner",
  });
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(await response.json()).toEqual({
    status: "confirmed",
    payment_status: "paid",
  });
});

it("rejects anonymous requests and does not expose other travelers' bookings", async () => {
  authenticate.mockResolvedValueOnce({ supabase: {}, user: null });
  expect((await requestPayment()).status).toBe(401);
  expect(getCheckoutBooking).not.toHaveBeenCalled();

  getCheckoutBooking.mockResolvedValue({ _tag: "Right", right: null });
  expect((await requestPayment()).status).toBe(404);
});
