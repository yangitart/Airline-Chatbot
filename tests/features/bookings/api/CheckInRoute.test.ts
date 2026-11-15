import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/src/app/api/v1/bookings/[bookingId]/check-in/route";

const mocks = vi.hoisted(() => ({ authenticate: vi.fn(), checkIn: vi.fn() }));
vi.mock("@/src/core/api/supabase/authenticatedRequest", () => ({
  createAuthenticatedSupabaseContext: mocks.authenticate,
}));
vi.mock("@/src/features/bookings/ioc/serverTripOperations", () => ({
  createServerTripOperations: () => ({ checkInDemoBooking: { execute: mocks.checkIn } }),
}));
const context = { params: Promise.resolve({ bookingId: "owned-booking" }) };
function request(body: unknown) {
  return new NextRequest("http://localhost/api/v1/bookings/owned-booking/check-in", {
    method: "POST", body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.authenticate.mockResolvedValue({ supabase: {}, user: { id: "owner" } });
});
it("rejects guests and invalid flight legs before performing check-in", async () => {
  mocks.authenticate.mockResolvedValueOnce({ supabase: {}, user: null });
  expect((await POST(request({ flight_leg: "outbound" }), context)).status).toBe(401);
  expect((await POST(request({ flight_leg: "other" }), context)).status).toBe(422);
  expect(mocks.checkIn).not.toHaveBeenCalled();
});
it.each([
  ["payment_required", 409], ["booking_not_found", 404],
  ["checkin_window_closed", 409], ["flight_not_checkin_eligible", 409],
  ["flight_leg_not_found", 409], ["booking_not_eligible", 409],
])("preserves the server rejection %s without reporting success", async (code, status) => {
  mocks.checkIn.mockResolvedValue({ _tag: "Left", left: code });
  const response = await POST(request({ flight_leg: "return" }), context);
  expect(response.status).toBe(status);
  expect(await response.json()).toMatchObject({ error_code: code });
});
it("returns a sample check-in only after the selected leg is accepted", async () => {
  mocks.checkIn.mockResolvedValue({ _tag: "Right", right: {
    demo_seat: "12A", demo_boarding_pass_reference: "DEMO-SAMPLE", checked_in_at: "2026-11-15T12:00:00Z",
  } });
  const response = await POST(request({ flight_leg: "return" }), context);
  expect(mocks.checkIn).toHaveBeenCalledWith({ bookingId: "owned-booking", flightLeg: "return" });
  expect(await response.json()).toMatchObject({ checked_in: true, flight_leg: "return", is_demo: true, demo_seat: "12A" });
});
