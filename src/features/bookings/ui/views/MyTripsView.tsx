"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import {
  CircleCheck,
  ArrowLeft,
  ClipboardCheck,
  Clock3,
  LoaderCircle,
  Plane,
  Radar,
} from "lucide-react";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import type { Booking } from "../../domain/models/Booking";
import { bookingServices } from "../../ioc/bookingServices";
import { SkeletonBlock } from "@/src/components/feedback/SkeletonBlock";
import { getDemoAirportTimeZone } from "@/src/features/flights/domain/models/DemoRoutes";
import { getFlightStatusDate } from "@/src/features/flights/domain/models/FlightStatusLookup";

type BookingPayment = Pick<Booking, "status" | "paymentStatus">;

function mergeBookingPayment(
  booking: Booking,
  payment: BookingPayment,
): Booking {
  return {
    ...booking,
    ...payment,
    // A response started before check-in can still report "confirmed".
    status:
      booking.status === "checked_in" && payment.status === "confirmed"
        ? booking.status
        : payment.status,
  };
}

async function getBookingPayment(
  id: string,
  signal?: AbortSignal,
): Promise<BookingPayment> {
  const response = await fetch(
    `/api/v1/bookings/${encodeURIComponent(id)}?fields=payment`,
    { signal },
  );
  if (!response.ok) throw new Error("payment_status_unavailable");
  const payment: {
    status: Booking["status"];
    payment_status: Booking["paymentStatus"];
  } = await response.json();
  return { status: payment.status, paymentStatus: payment.payment_status };
}

export default function MyTripsView({
  checkInMode,
  payment,
  bookingId,
}: {
  checkInMode: boolean;
  payment: "return" | "cancelled" | null;
  bookingId: string | null;
}) {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [checkingPaymentId, setCheckingPaymentId] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const locale = i18n.resolvedLanguage ?? "en";
  const formatters = useMemo(() => {
    const dates = new Map<string, Intl.DateTimeFormat>();
    const currencies = new Map<string, Intl.NumberFormat>();
    return {
      dateTime(value: string, airport: string) {
        const timeZone = getDemoAirportTimeZone(airport);
        const key = timeZone ?? "";
        let formatter = dates.get(key);
        if (!formatter) {
          formatter = new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone,
          });
          dates.set(key, formatter);
        }
        return formatter.format(new Date(value));
      },
      money(minor: number, currency: string) {
        let formatter = currencies.get(currency);
        if (!formatter) {
          formatter = new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            currencyDisplay: "code",
          });
          currencies.set(currency, formatter);
        }
        return formatter.format(minor / 100);
      },
    };
  }, [locale]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const targetBookingId = payment === "return" ? bookingId : null;
    if (payment === "cancelled") {
      setPaymentMessage("tripOperations.paymentCancelled");
    } else if (targetBookingId) {
      setPaymentMessage("tripOperations.paymentVerificationPending");
    }

    let active = true;
    let hasTargetBooking = false;
    const controller = new AbortController();
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reportPaymentResult = (booking?: BookingPayment) => {
      if (booking?.paymentStatus === "paid") {
        setPaymentMessage("tripOperations.paymentVerified");
        return true;
      }
      if (
        booking?.paymentStatus === "failed" ||
        booking?.status === "expired"
      ) {
        setPaymentMessage(
          booking.status === "expired"
            ? "tripOperations.checkoutExpired"
            : "tripOperations.paymentFailed",
        );
        return true;
      }
      return false;
    };

    const pollPayment = async (bookingId: string) => {
      try {
        if (hasTargetBooking) {
          const payment = await getBookingPayment(bookingId, controller.signal);
          if (!active) return;
          setBookings((current) =>
            current.map((item) =>
              item.id === bookingId ? mergeBookingPayment(item, payment) : item,
            ),
          );
          if (reportPaymentResult(payment)) return;
        } else {
          const result = await bookingServices.getMyBooking.execute(bookingId);
          if (!active) return;
          if (!isLeft(result) && result.right) {
            const booking = result.right;
            hasTargetBooking = true;
            setBookings((current) => [
              booking,
              ...current.filter((item) => item.id !== booking.id),
            ]);
            if (reportPaymentResult(booking)) return;
          }
        }
      } catch {
        // A transient status error follows the same retry schedule.
      }

      if (!active) return;
      attempts += 1;
      if (attempts < 6) schedulePoll(bookingId);
      else setPaymentMessage("tripOperations.paymentStillPending");
    };

    function schedulePoll(bookingId: string) {
      timer = setTimeout(
        () => void pollPayment(bookingId),
        Math.min(2000 * 2 ** attempts, 8000),
      );
    }

    const loadTrips = async () => {
      const result = await bookingServices.listMyBookings.execute();
      if (!active) return;
      setLoading(false);
      const trips = isLeft(result) ? [] : result.right;
      if (isLeft(result)) setError("flightSearch.booking.tripsLoadFailed");
      else {
        setError("");
        const selected = trips.find((trip) => trip.id === bookingId);
        hasTargetBooking = Boolean(selected);
        setBookings(
          selected
            ? [selected, ...trips.filter((trip) => trip.id !== selected.id)]
            : trips,
        );
      }
      if (
        targetBookingId &&
        !reportPaymentResult(trips.find((trip) => trip.id === targetBookingId))
      ) {
        schedulePoll(targetBookingId);
      }
    };

    void loadTrips().catch(() => {
      if (!active) return;
      setLoading(false);
      setError("flightSearch.booking.tripsLoadFailed");
      if (targetBookingId)
        setPaymentMessage("tripOperations.paymentStillPending");
    });
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [bookingId, loadAttempt, payment]);
  const startPayment = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    setActionMessage("");
    try {
      const response = await fetch(`/api/v1/bookings/${id}/checkout`, {
        method: "POST",
      });
      const body = await response.json();
      if (body.error_code === "payment_verifying") {
        await refreshPayment(id);
        return;
      }
      if (body.error_code === "checkout_expired")
        throw new Error(t("tripOperations.checkoutExpired"));
      if (!response.ok)
        throw new Error(
          body.error_code
            ? t(`tripOperations.errors.${body.error_code}`)
            : t("tripOperations.genericError"),
        );
      window.location.assign(body.checkout_url);
    } catch (cause) {
      setActionMessage(
        cause instanceof Error
          ? cause.message
          : t("tripOperations.genericError"),
      );
    } finally {
      setBusyId("");
    }
  };
  const checkIn = async (id: string, flightLeg: "outbound" | "return") => {
    if (busyId) return;
    setBusyId(id);
    setActionMessage("");
    try {
      const response = await fetch(`/api/v1/bookings/${id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flight_leg: flightLeg }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error_code
            ? t(`tripOperations.errors.${body.error_code}`)
            : t("tripOperations.genericError"),
        );
      setActionMessage(
        t("tripOperations.checkinSuccess", {
          seat: body.demo_seat,
          reference: displayReference(body.boarding_pass_reference),
        }),
      );
      setBookings((current) =>
        current.map((booking) =>
          booking.id !== id
            ? booking
            : {
                ...booking,
                status: "checked_in",
                checkIns: [
                  ...booking.checkIns.filter(
                    (item) => item.flightLeg !== flightLeg,
                  ),
                  {
                    flightLeg,
                    checkedInAt: body.checked_in_at,
                    demoSeat: body.demo_seat,
                    boardingPassReference: body.boarding_pass_reference,
                  },
                ],
              },
        ),
      );
    } catch (cause) {
      setActionMessage(
        cause instanceof Error
          ? cause.message
          : t("tripOperations.genericError"),
      );
    } finally {
      setBusyId("");
    }
  };

  const refreshPayment = async (id: string) => {
    setCheckingPaymentId(id);
    setActionMessage("");
    try {
      const updated = await getBookingPayment(id);
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? mergeBookingPayment(booking, updated) : booking,
        ),
      );
      setPaymentMessage(
        updated.paymentStatus === "paid"
          ? "tripOperations.paymentVerified"
          : updated.status === "expired"
            ? "tripOperations.checkoutExpired"
            : updated.paymentStatus === "failed"
              ? "tripOperations.paymentFailed"
              : "tripOperations.paymentStillPending",
      );
    } catch {
      setPaymentMessage("tripOperations.genericError");
    } finally {
      setCheckingPaymentId("");
    }
  };

  const displayReference = (reference: string) =>
    reference.replace(/^DEMO-/i, "AI-");
  const now = Date.now();

  return (
    <TravelSectionLayout
      eyebrow={t("travelPages.eyebrow")}
      title={
        checkInMode
          ? t("tripOperations.checkInPageTitle")
          : t("flightSearch.booking.myTrips")
      }
      description={
        checkInMode
          ? t("tripOperations.checkInPageDescription")
          : t("flightSearch.booking.demoOnly")
      }
      headingIcon={
        checkInMode ? (
          <ClipboardCheck size={45} strokeWidth={1.35} />
        ) : undefined
      }
    >
      {checkInMode && (
        <Link
          href="/my-trips"
          className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-airline-forest underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("tripOperations.backTrips")}
        </Link>
      )}
      {(actionMessage || paymentMessage) && (
        <p
          className="mb-4 animate-soft-rise rounded-2xl border border-airline-line bg-airline-paper p-4 text-sm shadow-sm motion-reduce:animate-none"
          role="status"
        >
          {actionMessage || t(paymentMessage)}
        </p>
      )}
      {loading && (
        <div
          className="grid gap-4"
          role="status"
          aria-label={t("flightSearch.booking.loadingTrips")}
        >
          {[0, 1].map((item) => (
            <article
              key={item}
              className="rounded-[24px] border border-airline-line bg-airline-paper p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-7 w-28 rounded-full" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-10 w-36 rounded-full" />
              </div>
            </article>
          ))}
          <span className="sr-only">
            {t("flightSearch.booking.loadingTrips")}
          </span>
        </div>
      )}
      {error && (
        <div className="animate-soft-rise rounded-2xl border border-[#f1d4cd] bg-[#fff8f6] p-4 text-[#b42318] motion-reduce:animate-none">
          <p role="alert">{t(error)}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            className="mt-2 inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
          >
            {t("tripOperations.retryTrips")}
          </button>
        </div>
      )}
      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-airline-line bg-airline-paper p-6 text-airline-muted">
          <p>{t("flightSearch.booking.noTrips")}</p>
          <Link
            href="/#search"
            className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-airline-forest px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("tripOperations.backSearch")}
          </Link>
        </div>
      )}
      <div className="grid gap-4">
        {bookings.map((booking, index) => {
          const outboundOffer = booking.itinerarySnapshot.outbound;
          const returnOffer = booking.itinerarySnapshot.return;
          const outboundSegments = outboundOffer.itineraries[0]?.segments ?? [];
          const returnSegments = returnOffer?.itineraries[0]?.segments ?? [];
          const outbound = outboundSegments[0];
          const outboundArrival = outboundSegments.at(-1)?.arrival;
          const inbound = returnSegments[0];
          const inboundArrival = returnSegments.at(-1)?.arrival;
          if (!outbound) return null;
          return (
            <article
              key={booking.id}
              style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
              className={`animate-soft-rise overflow-hidden rounded-[24px] border bg-airline-paper shadow-[0_12px_36px_rgb(23_40_59_/_6%)] motion-reduce:animate-none ${booking.id === bookingId ? "border-airline-forest/55 ring-1 ring-airline-forest/15" : "border-airline-line"}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b border-airline-line/70 px-5 py-4 sm:px-7 ${checkInMode ? "bg-airline-forest-soft" : ""}`}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-airline-garnet">
                    {t("flightSearch.booking.demoBooking")}
                  </p>
                  <h2 className="mt-1 text-base font-semibold tracking-wide">
                    {displayReference(booking.bookingReference)}
                  </h2>
                </div>
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${booking.paymentStatus === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-airline-gold/30 bg-airline-gold/10 text-[#6c5428]"}`}
                >
                  {t(`tripOperations.paymentStates.${booking.paymentStatus}`)}
                </span>
              </div>
              <div
                className={`grid gap-3 p-4 sm:p-6 ${inbound ? "sm:grid-cols-2" : ""}`}
              >
                {[
                  {
                    label: t("tripOperations.outbound"),
                    flightLeg: "outbound" as const,
                    segment: outbound,
                    arrival: outboundArrival,
                  },
                  ...(inbound
                    ? [
                        {
                          label: t("tripOperations.return"),
                          flightLeg: "return" as const,
                          segment: inbound,
                          arrival: inboundArrival,
                        },
                      ]
                    : []),
                ].map((leg) => {
                  const checkedIn = booking.checkIns.find(
                    (checkin) => checkin.flightLeg === leg.flightLeg,
                  );
                  const untilDeparture =
                    Date.parse(leg.segment.departure.at) - now;
                  const departureTimeZone = getDemoAirportTimeZone(
                    leg.segment.departure.iataCode,
                  );
                  const flightNumber = `${leg.segment.carrierCode} ${leg.segment.number}`;
                  const flightStatusQuery =
                    departureTimeZone && Number.isFinite(untilDeparture)
                      ? {
                          flight_number: flightNumber,
                          date: getFlightStatusDate(
                            leg.segment.departure.at,
                            departureTimeZone,
                          ),
                        }
                      : null;
                  const checkInWindowClosed =
                    untilDeparture > 48 * 60 * 60_000 ||
                    untilDeparture < 60 * 60_000;
                  return (
                    <section
                      key={leg.flightLeg}
                      className={`flex min-w-0 flex-col rounded-2xl border border-airline-line p-4 sm:p-5 ${checkInMode ? "bg-airline-canvas/60" : "bg-[#f7f6f1]"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-airline-muted">
                          {leg.label}
                        </span>
                        <span className="rounded-full border border-airline-line bg-airline-paper px-2.5 py-1 text-xs font-semibold text-airline-forest">
                          {flightNumber}
                        </span>
                      </div>
                      <div className="my-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <p className="font-serif text-3xl text-airline-night sm:text-4xl">
                            {leg.segment.departure.iataCode}
                          </p>
                          <time
                            dateTime={leg.segment.departure.at}
                            className="mt-1 block text-xs leading-5 text-airline-muted sm:text-sm"
                          >
                            {formatters.dateTime(
                              leg.segment.departure.at,
                              leg.segment.departure.iataCode,
                            )}
                          </time>
                        </div>
                        <span
                          aria-hidden="true"
                          className="rounded-full border border-airline-line bg-airline-paper p-2.5 text-airline-forest"
                        >
                          <Plane size={16} />
                        </span>
                        <div className="text-right">
                          <p className="font-serif text-3xl text-airline-night sm:text-4xl">
                            {leg.arrival?.iataCode ??
                              leg.segment.arrival.iataCode}
                          </p>
                          <time
                            dateTime={(leg.arrival ?? leg.segment.arrival).at}
                            className="mt-1 block text-xs leading-5 text-airline-muted sm:text-sm"
                          >
                            {leg.arrival
                              ? formatters.dateTime(
                                  leg.arrival.at,
                                  leg.arrival.iataCode,
                                )
                              : formatters.dateTime(
                                  leg.segment.arrival.at,
                                  leg.segment.arrival.iataCode,
                                )}
                          </time>
                        </div>
                      </div>
                      <div className="mt-auto border-t border-airline-line pt-3">
                        {checkedIn ? (
                          <p className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium leading-5 text-emerald-900">
                            <CircleCheck
                              size={16}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                            {t("tripOperations.boardingPass", {
                              seat: checkedIn.demoSeat,
                              reference: displayReference(
                                checkedIn.boardingPassReference,
                              ),
                            })}
                          </p>
                        ) : booking.paymentStatus === "paid" ? (
                          checkInWindowClosed ? (
                            <p className="flex items-start gap-2 rounded-xl border border-airline-line bg-airline-paper px-3 py-3 text-sm leading-5 text-airline-muted">
                              <Clock3
                                size={15}
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              {t("tripOperations.errors.checkin_window_closed")}
                            </p>
                          ) : (
                            <button
                              type="button"
                              disabled={Boolean(busyId)}
                              onClick={() =>
                                void checkIn(booking.id, leg.flightLeg)
                              }
                              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-airline-forest px-4 py-2 text-sm font-semibold text-white hover:bg-[#24564d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest disabled:opacity-50 sm:w-auto"
                            >
                              <ClipboardCheck size={17} aria-hidden="true" />
                              {busyId === booking.id
                                ? t("tripOperations.working")
                                : t("tripOperations.checkIn")}
                            </button>
                          )
                        ) : checkInMode &&
                          !["expired", "cancelled"].includes(booking.status) ? (
                          <p className="rounded-xl bg-airline-gold/10 px-3 py-3 text-sm leading-5 text-[#6c5428]">
                            {t("tripOperations.errors.payment_required")}
                          </p>
                        ) : null}
                        {flightStatusQuery && (
                          <Link
                            href={{
                              pathname: "/flight-status",
                              query: flightStatusQuery,
                            }}
                            prefetch={false}
                            className="mt-3 flex min-h-10 w-fit items-center gap-2 rounded-lg text-xs font-semibold text-airline-forest underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            <Radar size={16} aria-hidden="true" />
                            {t("tripOperations.flightStatus")}
                          </Link>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
              <div className="flex flex-col gap-4 border-t border-airline-line/70 bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {booking.passengerCount} ·{" "}
                    {t(
                      `flightSearch.fields.${booking.cabinClass === "premium-economy" ? "premiumEconomy" : booking.cabinClass}`,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#755f34]">
                    {t("flightSearch.booking.demoNoTicket")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <strong className="mr-1 text-lg">
                    {formatters.money(booking.totalFareMinor, booking.currency)}
                  </strong>
                  {booking.paymentStatus !== "paid" &&
                    !["expired", "cancelled"].includes(booking.status) && (
                      <button
                        disabled={Boolean(busyId)}
                        onClick={() => void startPayment(booking.id)}
                        className="rounded-full bg-airline-forest px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgb(24_61_55_/_15%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24564d] hover:shadow-[0_10px_20px_rgb(24_61_55_/_22%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:opacity-50 motion-reduce:transform-none"
                      >
                        {busyId === booking.id
                          ? t("tripOperations.working")
                          : t("tripOperations.payTest")}
                      </button>
                    )}
                  {booking.paymentStatus === "checkout_pending" && (
                    <button
                      type="button"
                      disabled={
                        Boolean(checkingPaymentId) ||
                        paymentMessage ===
                          "tripOperations.paymentVerificationPending"
                      }
                      onClick={() => void refreshPayment(booking.id)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-airline-line bg-white px-4 text-xs font-semibold text-airline-forest hover:bg-airline-forest-soft disabled:opacity-60"
                    >
                      {checkingPaymentId === booking.id && (
                        <LoaderCircle
                          size={14}
                          className="animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      )}
                      {t("tripOperations.refreshPayment")}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </TravelSectionLayout>
  );
}
