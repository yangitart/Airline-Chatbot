import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ push: vi.fn(), changeLanguage: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
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
    expect(signIn).not.toHaveBeenCalled();
  });
});

describe("FlightsHeader section navigation", () => {
  it("keeps info sections public and sends guests to sign-in only from the account action", () => {
    const signIn = vi.fn();
    const { rerender } = render(<FlightsHeader user={null} authLoading={false} onSignIn={signIn} onSignOut={vi.fn()} />);
    expect(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "flightSearch.nav.whereFly" }).getAttribute("href")).toBe("/where-we-fly");
    fireEvent.click(screen.getByRole("button", { name: /flightSearch.nav.signIn/ }));
    expect(signIn).toHaveBeenCalledOnce();

    rerender(<FlightsHeader user={{ id: "1", name: "Traveler", email: "traveler@example.test", picture: "" }} authLoading={false} onSignIn={signIn} onSignOut={vi.fn()} />);
    expect(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "flightSearch.nav.prepareTravel" }).getAttribute("href")).toBe("/prepare-to-travel");
    expect(signIn).toHaveBeenCalledOnce();
  });
});
