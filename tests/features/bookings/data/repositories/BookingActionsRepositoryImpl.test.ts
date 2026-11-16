// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { BookingActionsRepositoryImpl } from "@/src/features/bookings/data/repositories/BookingActionsRepositoryImpl";

function dataSource() {
  return { createCheckout: vi.fn(), checkIn: vi.fn() };
}
const checkIn = {
  checked_in: true,
  flight_leg: "return",
  checked_in_at: "2026-11-15T12:00:00Z",
  demo_seat: "12C",
  boarding_pass_reference: "DEMO-AB123",
};

describe("booking actions repository", () => {
  it("maps a valid checkout URL", async () => {
    const source = dataSource();
    source.createCheckout.mockResolvedValue({
      checkout_url: "https://checkout.stripe.com/test-session",
    });
    await expect(
      BookingActionsRepositoryImpl(source).createCheckout("booking"),
    ).resolves.toEqual({
      _tag: "Right",
      right: "https://checkout.stripe.com/test-session",
    });
  });

  it.each(["http://checkout.test/session", "javascript:alert(1)", undefined])(
    "rejects an unsafe checkout URL %s",
    async (url) => {
      const source = dataSource();
      source.createCheckout.mockResolvedValue({ checkout_url: url });
      await expect(
        BookingActionsRepositoryImpl(source).createCheckout("booking"),
      ).resolves.toMatchObject({ _tag: "Left" });
    },
  );

  it("maps the confirmed check-in for the requested leg", async () => {
    const source = dataSource();
    source.checkIn.mockResolvedValue(checkIn);
    await expect(
      BookingActionsRepositoryImpl(source).checkIn("booking", "return"),
    ).resolves.toEqual({
      _tag: "Right",
      right: {
        flightLeg: "return",
        checkedInAt: checkIn.checked_in_at,
        demoSeat: "12C",
        boardingPassReference: "DEMO-AB123",
      },
    });
  });

  it("rejects a check-in for a different leg", async () => {
    const source = dataSource();
    source.checkIn.mockResolvedValue(checkIn);
    await expect(
      BookingActionsRepositoryImpl(source).checkIn("booking", "outbound"),
    ).resolves.toEqual({
      _tag: "Left",
      left: "checkin_failed",
    });
  });

  it.each([
    [401, "unexpected_error", "auth_required"],
    [409, "checkout_expired", "checkout_expired"],
    [409, "payment_verifying", "payment_verifying"],
    [404, "unexpected_error", "booking_not_found"],
  ])("maps HTTP %s and %s to %s", async (status, code, expected) => {
    const source = dataSource();
    source.createCheckout.mockRejectedValue({
      isAxiosError: true,
      response: { status, data: { error_code: code } },
    });
    await expect(
      BookingActionsRepositoryImpl(source).createCheckout("booking"),
    ).resolves.toEqual({ _tag: "Left", left: expected });
  });
});
