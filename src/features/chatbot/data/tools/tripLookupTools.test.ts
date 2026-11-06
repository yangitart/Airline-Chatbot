import { right } from "fp-ts/Either";
import { describe, expect, it, vi } from "vitest";
import { parseBookingLookup } from "@/src/features/bookings/domain/models/BookingReference";
import { createBookingLookupTool, createFlightStatusTool } from "./tripLookupTools";

describe("booking lookup", () => {
  it("accepts the displayed booking reference and uses an exact account-scoped lookup", async () => {
    const getMyBooking = vi.fn(async () => right(null));
    const listMyBookings = vi.fn(async () => right([]));
    const tool = createBookingLookupTool({
      getMyBooking: { execute: getMyBooking },
      listMyBookings: { execute: listMyBookings },
    });
    expect(parseBookingLookup(" ai-ab12cd34ef ")).toEqual({
      column: "booking_reference",
      value: "DEMO-AB12CD34EF",
    });
    await expect(tool.execute('{"reference":"AI-AB12CD34EF"}')).resolves.toEqual({
      modelResult: { error: "booking_not_found" },
    });
    expect(getMyBooking).toHaveBeenCalledWith("AI-AB12CD34EF");
    expect(listMyBookings).not.toHaveBeenCalled();
  });

  it("rejects a malformed reference instead of listing bookings", async () => {
    const listMyBookings = vi.fn(async () => right([]));
    const tool = createBookingLookupTool({
      getMyBooking: { execute: vi.fn(async () => right(null)) },
      listMyBookings: { execute: listMyBookings },
    });
    await expect(tool.execute('{"reference":"?"}')).resolves.toEqual({
      modelResult: { error: "invalid_booking_reference" },
    });
    expect(listMyBookings).not.toHaveBeenCalled();
  });
});

describe("flight status lookup", () => {
  it("normalizes the flight number and rejects impossible dates before querying", async () => {
    const execute = vi.fn(async () => right(null));
    const tool = createFlightStatusTool({ execute });
    await expect(tool.execute('{"flight_number":"ai101","date":"2026-02-31"}')).resolves.toEqual({
      modelResult: { error: "invalid_status_query" },
    });
    expect(execute).not.toHaveBeenCalled();

    await expect(tool.execute('{"flight_number":"ai101","date":"2026-11-05"}')).resolves.toEqual({
      modelResult: { error: "status_not_found" },
    });
    expect(execute).toHaveBeenCalledWith({ flightNumber: "AI 101", flightDate: "2026-11-05" });
  });
});
