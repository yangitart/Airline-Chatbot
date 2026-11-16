import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import { left, right } from "fp-ts/Either";
import { FlightSearchActionCard } from "@/src/features/chatbot/ui/components/FlightSearchActionCard";
import type { FlightSearchResult } from "@/src/features/flights/domain/models/FlightSearch";
import {
  BookingActionCard,
  ChatActionCards,
} from "@/src/features/chatbot/ui/components/TripActionCards";

const client = vi.hoisted(() => ({
  getBooking: vi.fn(),
  createCheckout: vi.fn(),
  checkIn: vi.fn(),
  createBooking: vi.fn(),
}));
vi.mock("@/src/features/bookings/ioc/bookingServices", () => ({
  bookingServices: {
    getMyBooking: { execute: client.getBooking },
    createDemoBooking: { execute: client.createBooking },
    createCheckout: { execute: client.createCheckout },
    checkIn: { execute: client.checkIn },
  },
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
  client.getBooking.mockResolvedValue(right(booking));
  client.checkIn.mockResolvedValue(
    right({
      flightLeg: "return",
      checkedInAt: "2026-11-05T09:00:00Z",
      demoSeat: "12C",
      boardingPassReference: "DEMO-9012CD34EF",
    }),
  );
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
  client.getBooking.mockResolvedValue(
    right({
      ...booking,
      status: "pending_payment",
      paymentStatus: "checkout_pending",
    }),
  );
  client.createCheckout.mockResolvedValue(left("payment_verifying"));
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

it("requests sign-in when a booking use case returns an expired-session error", async () => {
  const onSignIn = vi.fn();
  client.getBooking.mockResolvedValue(left("auth_required"));
  render(
    <BookingActionCard
      choices={[{ id: booking.id, reference: "AI-AB12CD34EF" }]}
      onSignIn={onSignIn}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "chatbot.tripActions.openBooking AI-AB12CD34EF",
    }),
  );
  await waitFor(() => expect(onSignIn).toHaveBeenCalledOnce());
  expect(client.createCheckout).not.toHaveBeenCalled();
  expect(client.checkIn).not.toHaveBeenCalled();
});

it("creates a booking only after confirmation and reuses it when checkout is retried", async () => {
  const result: FlightSearchResult = {
    origin: "DEL",
    destination: "BOM",
    departure_date: "2026-12-10",
    return_date: null,
    passengers: 1,
    cabin_class: "economy",
    is_mock: true,
    notice: "Demo inventory",
    return_flights: [],
    flights: [
      {
        id: "flight",
        offer_id: "offer",
        flight_number: "AI 101",
        departure: "08:00",
        arrival: "10:00",
        duration: "2h",
        departure_date: "2026-12-10",
        arrival_date: "2026-12-10",
        fare_minor: 10000,
        currency: "INR",
        number_of_bookable_seats: 3,
        is_demo: true,
        source_label: "Demo",
      },
    ],
  };
  client.createBooking.mockResolvedValue(right(booking));
  client.createCheckout.mockResolvedValue(left("checkout_expired"));
  render(
    <FlightSearchActionCard
      actionId="action"
      result={result}
      isAuthenticated
      onSignIn={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /AI 101/ }));
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.reviewCheckout" }),
  );
  expect(client.createBooking).not.toHaveBeenCalled();
  expect(client.createCheckout).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.createPaymentLink" }),
  );
  expect((await screen.findByRole("alert")).textContent).toBe(
    "tripOperations.checkoutExpired",
  );
  expect(client.createBooking).toHaveBeenCalledWith({
    flightInstanceId: "flight",
    returnFlightInstanceId: undefined,
    cabinClass: "economy",
    passengerCount: 1,
    expectedOutboundFareMinor: 10000,
    expectedReturnFareMinor: undefined,
    idempotencyKey: "chat:action",
  });
  expect(client.createCheckout).toHaveBeenCalledWith(booking.id);
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.reviewCheckout" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "chatbot.createPaymentLink" }),
  );
  await waitFor(() => expect(client.createCheckout).toHaveBeenCalledTimes(2));
  expect(client.createBooking).toHaveBeenCalledOnce();
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
