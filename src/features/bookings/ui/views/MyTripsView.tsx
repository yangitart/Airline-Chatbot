"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
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

  const money = (minor: number, currency: string) => new Intl.NumberFormat(i18n.resolvedLanguage ?? "en", { style: "currency", currency }).format(minor / 100);

  return (
    <main className="min-h-screen bg-[#f4f2ee] px-4 py-8 text-[#162536]">
      <div className="mx-auto w-[min(100%,960px)]">
        <Link className="font-semibold text-[#86233d] underline" href="/">{t("flightSearch.booking.backToSearch")}</Link>
        <h1 className="mb-2 mt-6 text-3xl font-semibold">{t("flightSearch.booking.myTrips")}</h1>
        <p className="mb-6 text-sm text-[#65707c]">{t("flightSearch.booking.demoOnly")}</p>
        {loading && <p role="status">{t("flightSearch.booking.loadingTrips")}</p>}
        {error && <p className="rounded-lg bg-white p-4 text-[#b42318]" role="alert">{error}</p>}
        {!loading && !error && bookings.length === 0 && <p className="rounded-lg bg-white p-5">{t("flightSearch.booking.noTrips")}</p>}
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const outboundOffer = booking.itinerarySnapshot.outbound;
            const returnOffer = booking.itinerarySnapshot.return;
            const outbound = outboundOffer.itineraries[0]?.segments[0];
            const inbound = returnOffer?.itineraries[0]?.segments[0];
            if (!outbound) return null;
            return (
              <article key={booking.id} className="rounded-xl border border-[#e8e0d3] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#86233d]">{t("flightSearch.booking.demoBooking")}</p>
                    <h2 className="mt-1 text-xl font-semibold">{outbound.departure.iataCode} → {outbound.arrival.iataCode}{inbound ? ` → ${inbound.arrival.iataCode}` : ""}</h2>
                  </div>
                  <span className="rounded-full bg-[#f2ead6] px-3 py-1 text-xs font-bold text-[#6c5428]">{booking.bookingReference}</span>
                </div>
                <p className="mt-3 text-sm text-[#65707c]">{outbound.carrierCode} {outbound.number} · {new Date(outbound.departure.at).toLocaleString(i18n.resolvedLanguage)}</p>
                {inbound && <p className="mt-1 text-sm text-[#65707c]">{inbound.carrierCode} {inbound.number} · {new Date(inbound.departure.at).toLocaleString(i18n.resolvedLanguage)}</p>}
                <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-[#edf0f2] pt-4 text-sm">
                  <span>{booking.passengerCount} · {t(`flightSearch.fields.${booking.cabinClass === "premium-economy" ? "premiumEconomy" : booking.cabinClass}`)}</span>
                  <strong>{money(booking.totalFareMinor, booking.currency)}</strong>
                </div>
                <p className="mt-3 text-xs text-[#755f34]">{t("flightSearch.booking.demoNoTicket")}</p>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
