import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import { TripOperationError } from "@/src/features/chatbot/domain/repositories/ChatClient";
import {
  BookingActionCard,
  ChatActionCards,
} from "@/src/features/chatbot/ui/components/TripActionCards";

const client = vi.hoisted(() => ({
  getBooking: vi.fn(),
  createCheckout: vi.fn(),
  checkIn: vi.fn(),
}));
vi.mock("@/src/features/chatbot/ioc/chatServices", () => ({
  chatServices: { bookingClient: client, client: {} },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "en" },
    t: (key: string, values?: { reference?: string }) =>
      values?.reference ? `${key} ${values.reference}` : key,
  }),
}));

const booking: Booking = {
  id: "18651c57-3c98-43e4-9e64-cfe1d0130f06",
  bookingReference: "DEMO-AB12CD34EF",
  flightInstanceId: "outbound-flight",
  returnFlightInstanceId: "return-flight",
  cabinClass: "economy",
  passengerCount: 1,
  totalFareMinor: 100000,
  currency: "INR",
  status: "confirmed",
  paymentStatus: "paid",
  checkIns: [],
  isDemo: true,
  itinerarySnapshot: {
    outbound: { id: "outbound-offer", itineraries: [] },
    return: { id: "return-offer", itineraries: [] },
    cabin_class: "economy",
    passenger_count: 1,
    currency: "INR",
    total_fare_minor: 100000,
    is_demo: true,
  },
  flightOrderPayload: null,
  createdAt: "2026-11-05T08:00:00Z",
};

function openBooking() {
  render(
    <BookingActionCard
      choices={[{ id: booking.id, reference: "AI-AB12CD34EF" }]}
      onSignIn={vi.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "chatbot.tripActions.openBooking AI-AB12CD34EF",
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it("loads the current booking and waits for confirmation before checking in the selected leg", async () => {
  client.getBooking.mockResolvedValue(booking);
  client.checkIn.mockResolvedValue({
    flightLeg: "return",
    checkedInAt: "2026-11-05T09:00:00Z",
    demoSeat: "12C",
    boardingPassReference: "DEMO-9012CD34EF",
  });
  openBooking();
  const checkIn = await screen.findByRole("button", {
    name: "tripOperations.checkIn · tripOperations.return",
  });
  expect(client.getBooking).toHaveBeenCalledWith(
    booking.id,
    expect.any(AbortSignal),
  );
  fireEvent.click(checkIn);
  expect(client.checkIn).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.tripActions.confirm" }),
  );
  expect(client.checkIn).toHaveBeenCalledWith(booking.id, "return");
  expect(
    await screen.findByText("tripOperations.boardingPass AI-9012CD34EF"),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", {
      name: "tripOperations.checkIn · tripOperations.outbound",
    }),
  ).toBeTruthy();
});

it("uses the saved booking for checkout after confirmation and displays server errors", async () => {
  client.getBooking.mockResolvedValue({
    ...booking,
    status: "pending_payment",
    paymentStatus: "checkout_pending",
  });
  client.createCheckout.mockRejectedValue(
    new TripOperationError("payment_verifying"),
  );
  openBooking();
  fireEvent.click(
    await screen.findByRole("button", { name: "tripOperations.payTest" }),
  );
  expect(client.createCheckout).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.tripActions.confirm" }),
  );
  expect(client.createCheckout).toHaveBeenCalledWith(booking.id);
  expect((await screen.findByRole("alert")).textContent).toBe(
    "tripOperations.errors.payment_verifying",
  );
});

it("renders both cards and displays the departure in the airport's time zone", () => {
  render(
    <ChatActionCards
      isAuthenticated
      onSignIn={vi.fn()}
      action={{
        type: "action_group",
        data: [
          {
            type: "booking_results",
            data: [{ id: booking.id, reference: "AI-AB12CD34EF" }],
          },
          {
            type: "flight_status_result",
            data: {
              flightNumber: "AI 101",
              flightDate: "2026-11-05",
              status: "scheduled",
              isDemo: true,
              updatedAt: "2026-11-05T00:00:00Z",
              departureTimeZone: "Asia/Kolkata",
              arrivalTimeZone: "Asia/Kolkata",
              schedule: {
                originCode: "DEL",
                destinationCode: "BOM",
                departureAt: "2026-11-05T00:30:00Z",
                arrivalAt: "2026-11-05T02:45:00Z",
              },
            },
          },
        ],
      }}
    />,
  );
  expect(
    screen.getByRole("button", {
      name: "chatbot.tripActions.openBooking AI-AB12CD34EF",
    }),
  ).toBeTruthy();
  const status = screen.getByRole("region", {
    name: "tripOperations.flightStatus",
  });
  expect(within(status).getByText(/6:00\s*AM/)).toBeTruthy();
});
