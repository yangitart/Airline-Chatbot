"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import { injector } from "@/src/ioc/utils/injector";
import type { Booking } from "../../domain/models/Booking";
import { BookingSymbols } from "../../ioc/BookingSymbols";

type ListBookingsUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, Booking[]>>>;

export default function MyTripsView() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listBookings = useMemo(() => injector<ListBookingsUseCase>(BookingSymbols.listMyBookingsUseCase), []);

  const refresh = useCallback(() => {
    let active = true;
    void listBookings.execute()
      .then((result) => {
        if (!active) return;
        if (isLeft(result)) setError(t("flightSearch.booking.tripsLoadFailed"));
        else setBookings(result.right);
      })
      .catch(() => { if (active) setError(t("flightSearch.booking.tripsLoadFailed")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [listBookings, t]);

  useEffect(() => { const stop = refresh(); return stop; }, [refresh]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment") === "cancelled") {
      setActionMessage(t("tripOperations.paymentCancelled"));
      return;
    }
    if (query.get("payment") !== "return") return;
    const targetBookingId = query.get("booking_id");
    setActionMessage(t("tripOperations.paymentVerificationPending"));
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const poll = async () => {
      const result = await listBookings.execute();
      if (cancelled) return;
      if (!isLeft(result)) {
        setBookings(result.right);
        const returnedBooking = result.right.find((booking) => booking.id === targetBookingId);
        if (returnedBooking?.paymentStatus === "paid") {
          setActionMessage(t("tripOperations.paymentVerified"));
          return;
        }
        if (returnedBooking?.paymentStatus === "failed" || returnedBooking?.status === "expired") {
          setActionMessage(returnedBooking.status === "expired" ? t("tripOperations.checkoutExpired") : t("tripOperations.paymentFailed"));
          return;
        }
      }
      attempts += 1;
      if (attempts < 12) timer = setTimeout(() => void poll(), 2500);
      else setActionMessage(t("tripOperations.paymentStillPending"));
    };
    void poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [listBookings, t]);
  const [busyId, setBusyId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const startPayment = async (id: string) => {
    setBusyId(id); setActionMessage("");
    try {
      const response = await fetch(`/api/v1/bookings/${id}/checkout`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error_code ? t(`tripOperations.errors.${body.error_code}`) : t("tripOperations.genericError"));
      window.location.assign(body.checkout_url);
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : t("tripOperations.genericError")); }
    finally { setBusyId(""); }
  };
  const checkIn = async (id: string, flightLeg: "outbound" | "return") => {
    setBusyId(id); setActionMessage("");
    try {
      const response = await fetch(`/api/v1/bookings/${id}/check-in`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flight_leg: flightLeg }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error_code ? t(`tripOperations.errors.${body.error_code}`) : t("tripOperations.genericError"));
      setActionMessage(t("tripOperations.checkinSuccess", { seat: body.demo_seat, reference: body.boarding_pass_reference }));
      const result = await listBookings.execute();
      if (!isLeft(result)) setBookings(result.right);
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : t("tripOperations.genericError")); }
    finally { setBusyId(""); }
  };

  const money = (minor: number, currency: string) => new Intl.NumberFormat(i18n.resolvedLanguage ?? "en", { style: "currency", currency }).format(minor / 100);

  return (
    <main className="min-h-screen bg-[#f4f2ee] px-4 py-8 text-[#162536] sm:py-12">
      <div className="mx-auto w-[min(100%,960px)]">
        <section className="mb-7 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#17283b] to-[#34485a] px-6 py-8 text-white shadow-[0_18px_45px_rgb(23_40_59_/_12%)] sm:px-10">
          <Link className="text-sm font-semibold text-[#e5c98f] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="/">{t("flightSearch.booking.backToSearch")}</Link>
          <h1 className="mb-2 mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">{t("flightSearch.booking.myTrips")}</h1>
          <p className="max-w-xl text-sm leading-6 text-white/75">{t("flightSearch.booking.demoOnly")}</p>
          <Link className="mt-5 inline-flex rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10" href="/profile">{t("tripOperations.profile")}</Link>
        </section>
        {actionMessage && <p className="mb-4 rounded-xl bg-white p-4 text-sm" role="status">{actionMessage}</p>}
        {loading && <p role="status">{t("flightSearch.booking.loadingTrips")}</p>}
        {error && <p className="rounded-lg bg-white p-4 text-[#b42318]" role="alert">{error}</p>}
        {!loading && !error && bookings.length === 0 && <p className="rounded-lg bg-white p-5">{t("flightSearch.booking.noTrips")}</p>}
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const outboundOffer = booking.itinerarySnapshot.outbound;
            const returnOffer = booking.itinerarySnapshot.return;
            const outboundSegments = outboundOffer.itineraries[0]?.segments ?? [];
            const returnSegments = returnOffer?.itineraries[0]?.segments ?? [];
            const outbound = outboundSegments[0];
            const outboundArrival = outboundSegments.at(-1)?.arrival;
            const inbound = returnSegments[0];
            const inboundArrival = returnSegments.at(-1)?.arrival;
            if (!outbound) return null;
            const dateTime = (value: string) => new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
            return (
              <article key={booking.id} className="overflow-hidden rounded-[24px] border border-[#e8e0d3] bg-white shadow-[0_12px_36px_rgb(23_40_59_/_6%)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f2] px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#86233d]">{t("flightSearch.booking.demoBooking")}</p>
                    <h2 className="mt-1 text-base font-semibold tracking-wide">{booking.bookingReference}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${booking.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                    {t(`tripOperations.paymentStates.${booking.paymentStatus}`)}
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                  {[{ label: t("tripOperations.outbound"), flightLeg: "outbound" as const, segment: outbound, arrival: outboundArrival }, ...(inbound ? [{ label: t("tripOperations.return"), flightLeg: "return" as const, segment: inbound, arrival: inboundArrival }] : [])].map((leg) => {
                    const checkedIn = booking.checkIns.find((checkin) => checkin.flightLeg === leg.flightLeg);
                    return <section key={leg.label} className="rounded-2xl bg-[#f7f8f6] p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#68756e]">{leg.label}</span>
                        <span className="text-xs font-semibold text-[#68756e]">{leg.segment.carrierCode} {leg.segment.number}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div><p className="text-2xl font-semibold">{leg.segment.departure.iataCode}</p><p className="mt-1 text-xs text-[#68756e]">{dateTime(leg.segment.departure.at)}</p></div>
                        <span aria-hidden="true" className="px-2 text-[#a58a55]">→</span>
                        <div className="text-right"><p className="text-2xl font-semibold">{leg.arrival?.iataCode ?? leg.segment.arrival.iataCode}</p><p className="mt-1 text-xs text-[#68756e]">{leg.arrival ? dateTime(leg.arrival.at) : dateTime(leg.segment.arrival.at)}</p></div>
                      </div>
                      {checkedIn ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">{t("tripOperations.boardingPass", { seat: checkedIn.demoSeat, reference: checkedIn.boardingPassReference })}</p> : booking.paymentStatus === "paid" && <button disabled={busyId === booking.id} onClick={() => void checkIn(booking.id, leg.flightLeg)} className="mt-4 rounded-full border border-[#183d37] px-4 py-2 text-xs font-semibold text-[#183d37] transition hover:bg-[#e8f0ec] disabled:opacity-50">{busyId === booking.id ? t("tripOperations.working") : t("tripOperations.checkIn")}</button>}
                    </section>;
                  })}
                </div>
                <div className="flex flex-col gap-4 border-t border-[#edf0f2] bg-[#fcfcfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{booking.passengerCount} · {t(`flightSearch.fields.${booking.cabinClass === "premium-economy" ? "premiumEconomy" : booking.cabinClass}`)}</p>
                    <p className="mt-1 text-xs text-[#755f34]">{t("flightSearch.booking.demoNoTicket")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <strong className="mr-1 text-lg">{money(booking.totalFareMinor, booking.currency)}</strong>
                    {booking.paymentStatus !== "paid" && !["expired", "cancelled"].includes(booking.status) && <button disabled={busyId === booking.id} onClick={() => void startPayment(booking.id)} className="rounded-full bg-[#183d37] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24564d] disabled:opacity-50">{busyId === booking.id ? t("tripOperations.working") : t("tripOperations.payTest")}</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
