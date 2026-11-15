import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StrictMode, type ReactNode } from "react";
import MyTripsView from "@/src/features/bookings/ui/views/MyTripsView";

const mocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), success: vi.fn(), t: (key: string) => key }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: mocks.t, i18n: { resolvedLanguage: "en" } }) }));
vi.mock("react-hot-toast", () => ({ default: { success: mocks.success } }));
vi.mock("@/src/features/bookings/ioc/bookingServices", () => ({ bookingServices: {
  listMyBookings: { execute: mocks.list }, getMyBooking: { execute: mocks.get },
} }));
vi.mock("@/src/components/layout/TravelSectionLayout", () => ({ TravelSectionLayout: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
const trip = {
  id: "booking-1", status: "confirmed", paymentStatus: "paid",
  itinerarySnapshot: { outbound: { itineraries: [] } },
};
beforeEach(() => { mocks.list.mockResolvedValue({ _tag: "Right", right: [trip] }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers(); });
it("announces a verified payment once across StrictMode effects and translation changes", async () => {
  const view = render(<StrictMode><MyTripsView checkInMode={false} payment="return" bookingId={trip.id} /></StrictMode>);
  await waitFor(() => expect(mocks.success).toHaveBeenCalledTimes(1));
  const oldTranslation = mocks.t;
  mocks.t = (key: string) => key;
  view.rerender(<StrictMode><MyTripsView checkInMode={false} payment="return" bookingId={trip.id} /></StrictMode>);
  await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(3));
  expect(mocks.success).toHaveBeenCalledTimes(1);
  mocks.t = oldTranslation;
});
it("does not confirm payment from a successful redirect while payment is pending", async () => {
  vi.useFakeTimers();
  mocks.list.mockResolvedValue({ _tag: "Right", right: [{ ...trip, status: "pending_payment", paymentStatus: "checkout_pending" }] });
  render(<MyTripsView checkInMode={false} payment="return" bookingId={trip.id} />);
  await act(async () => {});
  expect(mocks.list).toHaveBeenCalled();
  expect(mocks.success).not.toHaveBeenCalled();
});
it("does not announce payment when simply viewing already paid trips or cancelling checkout", async () => {
  const view = render(<MyTripsView checkInMode={false} payment={null} bookingId={trip.id} />);
  await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(1));
  view.rerender(<MyTripsView checkInMode={false} payment="cancelled" bookingId={null} />);
  await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(2));
  expect(mocks.success).not.toHaveBeenCalled();
});
