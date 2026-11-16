// @vitest-environment node
import { expect, it, vi } from "vitest";
import { BookingRepositoryImpl } from "@/src/features/bookings/data/repositories/BookingRepositoryImpl";

function source() {
  return {
    getMyBooking: vi.fn(),
    createDemoBooking: vi.fn(),
    listMyBookings: vi.fn(),
  };
}

it("passes cancellation through to the booking transport", async () => {
  const dataSource = source();
  dataSource.getMyBooking.mockResolvedValue(null);
  const signal = new AbortController().signal;
  await expect(
    BookingRepositoryImpl(dataSource).getMyBooking("owned", signal),
  ).resolves.toEqual({ _tag: "Right", right: null });
  expect(dataSource.getMyBooking).toHaveBeenCalledWith("owned", signal);
});

it.each(["inventory_changed", "fare_changed", "flight_unavailable"])(
  "preserves the booking conflict %s",
  async (code) => {
    const dataSource = source();
    dataSource.createDemoBooking.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { error_code: code } },
    });
    const command = {
      flightInstanceId: "flight",
      cabinClass: "economy",
      passengerCount: 1,
      expectedOutboundFareMinor: 1000,
      idempotencyKey: "chat:action",
    };
    await expect(
      BookingRepositoryImpl(dataSource).createDemoBooking(command),
    ).resolves.toEqual({ _tag: "Left", left: code });
  },
);

it("rejects a booking response for a different ID", async () => {
  const dataSource = source();
  dataSource.getMyBooking.mockResolvedValue({ id: "other-booking" });
  await expect(
    BookingRepositoryImpl(dataSource).getMyBooking("owned"),
  ).resolves.toEqual({ _tag: "Left", left: "booking_not_found" });
});
