"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import { injector } from "@/src/ioc/utils/injector";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import type { Booking } from "../../domain/models/Booking";
import { BookingSymbols } from "../../ioc/BookingSymbols";
import { SkeletonBlock } from "@/src/components/feedback/SkeletonBlock";

type ListBookingsUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, Booking[]>>>;

export default function MyTripsView() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInMode, setCheckInMode] = useState(false);
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
    setCheckInMode(new URLSearchParams(window.location.search).get("check-in") === "1");
  }, []);
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
      if (body.error_code === "checkout_expired") throw new Error(t("tripOperations.checkoutExpired"));
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
      setActionMessage(t("tripOperations.checkinSuccess", { seat: body.demo_seat, reference: displayReference(body.boarding_pass_reference) }));
      const result = await listBookings.execute();
      if (!isLeft(result)) setBookings(result.right);
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : t("tripOperations.genericError")); }
    finally { setBusyId(""); }
  };

  const money = (minor: number, currency: string) => new Intl.NumberFormat(i18n.resolvedLanguage ?? "en", { style: "currency", currency }).format(minor / 100);
  const displayReference = (reference: string) => reference.replace(/^DEMO-/i, "AI-");

  return (
    <TravelSectionLayout eyebrow={t("travelPages.eyebrow")} title={checkInMode ? t("tripOperations.checkInPageTitle") : t("flightSearch.booking.myTrips")} description={checkInMode ? t("tripOperations.checkInPageDescription") : t("flightSearch.booking.demoOnly")}>
        {checkInMode && <div className="mb-6 animate-soft-rise rounded-2xl border border-airline-gold/30 bg-airline-gold/10 px-5 py-4 text-sm leading-6 text-[#6c5428] motion-reduce:animate-none">{t("tripOperations.checkInPageHint")}</div>}
        {actionMessage && <p className="mb-4 animate-soft-rise rounded-2xl border border-airline-line bg-airline-paper p-4 text-sm shadow-sm motion-reduce:animate-none" role="status">{actionMessage}</p>}
        {loading && <div className="grid gap-4" role="status" aria-label={t("flightSearch.booking.loadingTrips")}>
          {[0, 1].map((item) => <article key={item} className="rounded-[24px] border border-airline-line bg-airline-paper p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4"><SkeletonBlock className="h-4 w-40" /><SkeletonBlock className="h-7 w-28 rounded-full" /></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" /></div>
            <div className="mt-5 flex items-center justify-between gap-4"><SkeletonBlock className="h-4 w-32" /><SkeletonBlock className="h-10 w-36 rounded-full" /></div>
          </article>)}
          <span className="sr-only">{t("flightSearch.booking.loadingTrips")}</span>
        </div>}
        {error && <p className="animate-soft-rise rounded-2xl border border-[#f1d4cd] bg-[#fff8f6] p-4 text-[#b42318] motion-reduce:animate-none" role="alert">{error}</p>}
        {!loading && !error && bookings.length === 0 && <p className="animate-soft-rise rounded-2xl border border-dashed border-airline-line bg-airline-paper p-6 text-airline-muted motion-reduce:animate-none">{t("flightSearch.booking.noTrips")}</p>}
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
            const dateTime = (value: string) => new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
            return (
              <article key={booking.id} style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }} className="animate-soft-rise overflow-hidden rounded-[24px] border border-airline-line bg-airline-paper shadow-[0_12px_36px_rgb(23_40_59_/_6%)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgb(23_40_59_/_10%)] motion-reduce:animate-none motion-reduce:transform-none">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-airline-line/70 px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-airline-garnet">{t("flightSearch.booking.demoBooking")}</p>
                    <h2 className="mt-1 text-base font-semibold tracking-wide">{displayReference(booking.bookingReference)}</h2>
                  </div>
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${booking.paymentStatus === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-airline-gold/30 bg-airline-gold/10 text-[#6c5428]"}`}>
                    {t(`tripOperations.paymentStates.${booking.paymentStatus}`)}
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                  {[{ label: t("tripOperations.outbound"), flightLeg: "outbound" as const, segment: outbound, arrival: outboundArrival }, ...(inbound ? [{ label: t("tripOperations.return"), flightLeg: "return" as const, segment: inbound, arrival: inboundArrival }] : [])].map((leg) => {
                    const checkedIn = booking.checkIns.find((checkin) => checkin.flightLeg === leg.flightLeg);
                    return <section key={leg.label} className="group rounded-2xl border border-airline-line/60 bg-[#f7f6f1] p-4 transition-all duration-300 hover:border-airline-gold/60 hover:bg-white sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-airline-muted">{leg.label}</span>
                        <span className="text-xs font-semibold text-airline-muted">{leg.segment.carrierCode} {leg.segment.number}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div><p className="text-2xl font-semibold text-airline-night">{leg.segment.departure.iataCode}</p><p className="mt-1 text-xs text-airline-muted">{dateTime(leg.segment.departure.at)}</p></div>
                        <span aria-hidden="true" className="px-2 text-airline-gold transition-transform duration-500 group-hover:translate-x-1">→</span>
                        <div className="text-right"><p className="text-2xl font-semibold text-airline-night">{leg.arrival?.iataCode ?? leg.segment.arrival.iataCode}</p><p className="mt-1 text-xs text-airline-muted">{leg.arrival ? dateTime(leg.arrival.at) : dateTime(leg.segment.arrival.at)}</p></div>
                      </div>
                      {checkedIn ? <p className="mt-4 animate-soft-rise rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 motion-reduce:animate-none">{t("tripOperations.boardingPass", { seat: checkedIn.demoSeat, reference: displayReference(checkedIn.boardingPassReference) })}</p> : booking.paymentStatus === "paid" && <button disabled={busyId === booking.id} onClick={() => void checkIn(booking.id, leg.flightLeg)} className="mt-4 rounded-full border border-airline-forest px-4 py-2 text-xs font-semibold text-airline-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-airline-forest-soft hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet disabled:opacity-50 motion-reduce:transform-none">{busyId === booking.id ? t("tripOperations.working") : t("tripOperations.checkIn")}</button>}
                    </section>;
                  })}
                </div>
                <div className="flex flex-col gap-4 border-t border-airline-line/70 bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{booking.passengerCount} · {t(`flightSearch.fields.${booking.cabinClass === "premium-economy" ? "premiumEconomy" : booking.cabinClass}`)}</p>
                    <p className="mt-1 text-xs text-[#755f34]">{t("flightSearch.booking.demoNoTicket")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <strong className="mr-1 text-lg">{money(booking.totalFareMinor, booking.currency)}</strong>
                    {booking.paymentStatus !== "paid" && !["expired", "cancelled"].includes(booking.status) && <button disabled={busyId === booking.id} onClick={() => void startPayment(booking.id)} className="rounded-full bg-airline-forest px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgb(24_61_55_/_15%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24564d] hover:shadow-[0_10px_20px_rgb(24_61_55_/_22%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:opacity-50 motion-reduce:transform-none">{busyId === booking.id ? t("tripOperations.working") : t("tripOperations.payTest")}</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
    </TravelSectionLayout>
  );
}
