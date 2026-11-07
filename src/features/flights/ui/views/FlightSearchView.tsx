"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useTravelShell } from "@/src/components/layout/TravelShellContext";
import type {
  Booking,
  CreateDemoBookingCommand,
} from "@/src/features/bookings/domain/models/Booking";
import { bookingServices } from "@/src/features/bookings/ioc/bookingServices";
import {
  FlightSearchQuery,
  FlightSearchResult,
} from "../../domain/models/FlightSearch";
import type { FeaturedFlight } from "../../domain/models/FeaturedFlight";
import { flightSearchServices } from "../../ioc/flightSearchServices";
import { FlightSearchForm, localDate } from "../components/FlightSearchForm";
import { BookingTabs } from "../components/BookingTabs";
import { FlightResults } from "../components/FlightResults";
import { FlightHero } from "../components/FlightHero";
import {
  FlightRouteFromUrl,
  type RoutePrefill,
} from "../components/FlightRouteFromUrl";

export default function FlightSearchView() {
  const { t } = useTranslation();
  const { user, authLoading, openSignIn, registerSearchAction } =
    useTravelShell();
  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [routeRevision, setRouteRevision] = useState(0);
  const [featuredFlights, setFeaturedFlights] = useState<FeaturedFlight[]>([]);
  const [routePrefill, setRoutePrefill] = useState<RoutePrefill | null>(null);
  useEffect(() => {
    let active = true;
    void flightSearchServices.featured
      .execute(localDate(1))
      .then((result) => {
        if (active) setFeaturedFlights(isLeft(result) ? [] : result.right);
      })
      .catch(() => {
        if (active) setFeaturedFlights([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const submitDemoBooking = useCallback(
    async (command: CreateDemoBookingCommand) => {
      setBookingBusy(true);
      setBookingError("");
      try {
        const result = await bookingServices.createDemoBooking.execute(command);
        if (isLeft(result)) {
          setBookingError(t("flightSearch.booking.saveFailed"));
          return;
        }
        setBooking(result.right);
      } catch {
        setBookingError(t("flightSearch.booking.saveFailed"));
      } finally {
        setBookingBusy(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (!user) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("signedIn") !== "1") return;
    url.searchParams.delete("signedIn");
    window.history.replaceState(window.history.state, "", url);
    try {
      const pending = window.sessionStorage.getItem(
        "airline-pending-demo-booking",
      );
      window.sessionStorage.removeItem("airline-pending-demo-booking");
      if (pending)
        void submitDemoBooking(JSON.parse(pending) as CreateDemoBookingCommand);
    } catch {
      /* No recoverable booking. */
    }
  }, [user, submitDemoBooking]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("authError")) {
      setError(t("flightSearch.errors.signInFailed"));
      url.searchParams.delete("authError");
      window.history.replaceState(window.history.state, "", url);
    }
  }, [t]);

  const selectRoute = useCallback((route: RoutePrefill) => {
    setResults(null);
    setRoutePrefill(route);
    setRouteRevision((revision) => revision + 1);
    requestAnimationFrame(() => {
      document.getElementById("booking-title")?.focus({ preventScroll: true });
      document.getElementById("search")?.scrollIntoView({ block: "start" });
    });
  }, []);

  const searchFlights = useCallback(
    async (query: FlightSearchQuery) => {
      setError("");
      setBooking(null);
      setBookingError("");
      setResults(null);
      try {
        const result = await flightSearchServices.search.execute(query);
        if (isLeft(result)) {
          setError(t("flightSearch.errors.searchFailed"));
          return;
        }
        setResults(result.right);
        requestAnimationFrame(() => {
          const panel = document.getElementById("flight-search-results");
          panel?.focus({ preventScroll: true });
          panel?.scrollIntoView({ block: "start" });
        });
      } catch {
        setError(t("flightSearch.errors.searchFailed"));
      }
    },
    [t],
  );

  const bookFlight = useCallback(
    (
      flightInstanceId: string,
      returnFlightInstanceId: string | undefined,
      expectedOutboundFareMinor: number,
      expectedReturnFareMinor?: number,
    ) => {
      if (!results) return;
      const command: CreateDemoBookingCommand = {
        flightInstanceId,
        returnFlightInstanceId,
        cabinClass: results.cabin_class,
        passengerCount: results.passengers,
        expectedOutboundFareMinor,
        expectedReturnFareMinor,
        idempotencyKey: window.crypto.randomUUID(),
      };
      setBooking(null);
      setBookingError("");
      if (!user) {
        setBookingError(t("flightSearch.booking.signInRequired"));
        openSignIn(() => {
          try {
            window.sessionStorage.setItem(
              "airline-pending-demo-booking",
              JSON.stringify(command),
            );
          } catch {
            /* Sign-in can continue when storage is unavailable. */
          }
        });
        return;
      }
      void submitDemoBooking(command);
    },
    [openSignIn, results, submitDemoBooking, t, user],
  );

  const backToSearch = useCallback(() => {
    setResults(null);
    requestAnimationFrame(() => {
      const heading = document.getElementById("booking-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "nearest" });
    });
  }, []);

  useEffect(() => {
    if (results) return registerSearchAction(backToSearch);
  }, [backToSearch, registerSearchAction, results]);

  return (
    <section
      id="book-manage"
      aria-label={t("flightSearch.booking.title")}
      className="relative isolate min-h-[calc(100dvh-62px)] scroll-mt-[calc(62px_+_0.75rem)] text-airline-ink sm:min-h-[calc(100dvh-72px)] sm:scroll-mt-[calc(72px_+_1rem)]"
    >
      <Suspense fallback={null}>
        <FlightRouteFromUrl onSelect={selectRoute} />
      </Suspense>
      <div
        className={`mx-auto grid max-w-[1440px] items-stretch gap-4 px-4 py-5 sm:gap-6 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-8 ${results ? "lg:hidden" : ""}`}
      >
        <FlightHero
          flights={featuredFlights}
          selectedDestination={
            results?.destination ?? routePrefill?.destination
          }
          onSelectRoute={selectRoute}
        />
        <section
          className="min-w-0 scroll-mt-20 rounded-[28px] border border-airline-line bg-airline-paper p-5 shadow-[0_16px_48px_rgb(23_40_59_/_7%)] sm:p-7 lg:p-8"
          id="search"
          aria-labelledby="booking-title"
        >
          <h2
            className="mb-5 text-2xl font-semibold tracking-tight text-airline-night sm:text-3xl"
            id="booking-title"
            tabIndex={-1}
          >
            {t("flightSearch.booking.title")}
          </h2>
          <BookingTabs
            isAuthenticated={Boolean(user)}
            authLoading={authLoading}
            onSignIn={() => openSignIn()}
          />
          <FlightSearchForm
            key={
              routeRevision +
              (routePrefill
                ? `${routePrefill.origin}-${routePrefill.destination}`
                : "default-route")
            }
            initialOrigin={routePrefill?.origin}
            initialDestination={routePrefill?.destination}
            featuredDate={routePrefill?.date}
            onSearch={searchFlights}
          />
        </section>
      </div>
      {results ? (
        <div
          id="flight-search-results"
          className="mx-auto flex w-full max-w-[1180px] scroll-mt-[62px] flex-col px-3 pt-3 sm:scroll-mt-[72px] sm:px-6 lg:h-[calc(100dvh-72px)] lg:px-8"
          tabIndex={-1}
        >
          <FlightResults
            result={results}
            isAuthenticated={Boolean(user)}
            bookingBusy={bookingBusy}
            booking={booking}
            bookingError={bookingError}
            onBook={bookFlight}
            onBack={backToSearch}
          />
        </div>
      ) : error ? (
        <p
          className="mx-auto my-4 w-[min(96%,1500px)] text-[#b42318]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {!results && (bookingBusy || booking || bookingError) && (
        <div className="mx-auto my-4 max-w-[1180px] px-4">
          <p role={bookingError ? "alert" : "status"}>
            {bookingError ||
              (booking
                ? t("flightSearch.booking.saved", {
                    reference: booking.bookingReference.replace(
                      /^DEMO-/i,
                      "AI-",
                    ),
                  })
                : t("flightSearch.booking.saving"))}
          </p>
          {booking && (
            <Link className="text-airline-forest underline" href="/my-trips">
              {t("flightSearch.booking.myTrips")}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
