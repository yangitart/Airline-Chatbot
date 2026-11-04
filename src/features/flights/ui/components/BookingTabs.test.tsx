import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ push: vi.fn(), toast: vi.fn(), changeLanguage: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("react-hot-toast", () => ({ default: mocks.toast }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: "en", changeLanguage: mocks.changeLanguage } }) }));

import { BookingTabs } from "./BookingTabs";
import { FlightsHeader } from "./FlightsHeader";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("BookingTabs", () => {
  it("opens sign-in for a guest while leaving search public", () => {
    const signIn = vi.fn();
    render(<BookingTabs isAuthenticated={false} authLoading={false} onSignIn={signIn} />);

    expect(screen.getByRole("link", { name: "flightSearch.booking.searchFlights" }).getAttribute("href")).toBe("#search");
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.manageBooking" }));
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.checkIn" }));
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.flightStatus" }));
    expect(signIn).toHaveBeenCalledTimes(2);
    expect(mocks.push).toHaveBeenCalledWith("/flight-status");
  });

  it("opens trips, check-in, and public flight status for a signed-in user", () => {
    const signIn = vi.fn();
    render(<BookingTabs isAuthenticated authLoading={false} onSignIn={signIn} />);

    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.manageBooking" }));
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.checkIn" }));
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.booking.flightStatus" }));
    expect(mocks.push).toHaveBeenCalledWith("/my-trips");
    expect(mocks.push).toHaveBeenCalledWith("/my-trips?check-in=1");
    expect(mocks.push).toHaveBeenCalledWith("/flight-status");
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });
});

describe("FlightsHeader upcoming actions", () => {
  it("opens sign-in for a guest and shows a message for an authenticated user", () => {
    const signIn = vi.fn();
    const { rerender } = render(<FlightsHeader user={null} authLoading={false} onSignIn={signIn} onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.nav.whereFly" }));
    expect(signIn).toHaveBeenCalledOnce();

    rerender(<FlightsHeader user={{ id: "1", name: "Traveler", email: "traveler@example.test", picture: "" }} authLoading={false} onSignIn={signIn} onSignOut={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "flightSearch.nav.whereFly" }));
    expect(mocks.toast).toHaveBeenCalledWith("flightSearch.booking.comingSoon");
    expect(signIn).toHaveBeenCalledOnce();
  });
});
