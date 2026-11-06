"use client";

import { ArrowLeft, ArrowRight, Check, Plane } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import type { FlightOption, FlightSearchResult } from "../../domain/models/FlightSearch";
import { getDestinationPhoto } from "../../data/destinationPhotos";
import { DestinationCountry, DestinationPhotoCredit } from "./DestinationPhotoDetails";

const formatFare = (locale: string, currency: string, minor: number) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(minor / 100);

const formatDate = (locale: string, date: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(new Date(date + "T12:00:00"));

function FlightCard({ flight, selected, locale, origin, destination, perPassengerLabel, onSelect }: {
  flight: FlightOption;
  selected: boolean;
  locale: string;
  origin: string;
  destination: string;
  perPassengerLabel: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect}
      className={`group grid w-full min-w-0 gap-4 rounded-2xl border px-4 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest sm:grid-cols-[minmax(0,1fr)_minmax(8rem,auto)] sm:items-center sm:px-5 ${selected ? "border-airline-forest bg-[#edf4ed]" : "border-airline-line bg-airline-paper hover:border-airline-forest/60"}`}>
      <span className="min-w-0">
        <span className="text-xs font-semibold tracking-wide text-airline-muted">{flight.flight_number}</span>
        <span className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
          <span>
            <strong className="block text-xl font-semibold tabular-nums text-airline-night sm:text-2xl">{flight.departure}</strong>
            <span className="text-xs text-airline-muted">{origin}</span>
          </span>
          <span className="text-center text-xs text-airline-muted">
            <span className="mb-1 flex items-center gap-1 text-airline-forest" aria-hidden="true"><span className="flex-1 border-t border-airline-forest/20" /><Plane size={14} /><span className="flex-1 border-t border-airline-forest/20" /></span>
            {flight.duration}
          </span>
          <span className="text-right">
            <strong className="block text-xl font-semibold tabular-nums text-airline-night sm:text-2xl">{flight.arrival}</strong>
            <span className="text-xs text-airline-muted">{destination}</span>
            {flight.arrival_date !== flight.departure_date && <span className="block text-xs text-airline-muted">{formatDate(locale, flight.arrival_date)}</span>}
          </span>
        </span>
      </span>
      <span className="flex min-w-0 items-center justify-between gap-4 border-t border-airline-line pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <span><strong className="block text-base font-semibold text-airline-night">{formatFare(locale, flight.currency, flight.fare_minor)}</strong><span className="text-xs text-airline-muted">{perPassengerLabel}</span></span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${selected ? "border-airline-forest bg-airline-forest text-white" : "border-airline-line text-airline-forest group-hover:border-airline-forest"}`} aria-hidden="true">{selected ? <Check size={16} /> : <span className="h-2 w-2 rounded-full border border-current" />}</span>
      </span>
    </button>
  );
}

export function FlightResults({ result, isAuthenticated, bookingBusy, booking, bookingError, onBook, onBack }: {
  result: FlightSearchResult;
  isAuthenticated: boolean;
  bookingBusy: boolean;
  booking: Booking | null;
  bookingError: string;
  onBook: (flightInstanceId: string, returnFlightInstanceId: string | undefined, expectedOutboundFareMinor: number, expectedReturnFareMinor?: number) => void;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [leg, setLeg] = useState<"outbound" | "return">("outbound");
  const [outbound, setOutbound] = useState<FlightOption | null>(null);
  const [inbound, setInbound] = useState<FlightOption | null>(null);
  const locale = i18n.resolvedLanguage ?? "en";
  const hasReturn = Boolean(result.return_date);
  const isReturn = leg === "return" && hasReturn;
  const origin = isReturn ? result.destination : result.origin;
  const destination = isReturn ? result.origin : result.destination;
  const photo = getDestinationPhoto(destination);
  const flights = isReturn ? result.return_flights : result.flights;
  const total = outbound && (!hasReturn || inbound)
    ? formatFare(locale, outbound.currency, (outbound.fare_minor + (inbound?.fare_minor ?? 0)) * result.passengers)
    : null;

  const legs = [
    { id: "outbound" as const, label: t("tripOperations.outbound"), instruction: t("flightSearch.results.outbound"), date: result.departure_date, flight: outbound },
    ...(result.return_date ? [{ id: "return" as const, label: t("tripOperations.return"), instruction: t("flightSearch.results.return"), date: result.return_date, flight: inbound }] : []),
  ];

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-4 pb-4" aria-labelledby="results-title">
      <header className="relative isolate shrink-0 overflow-hidden rounded-[26px] bg-airline-forest px-5 py-4 text-white sm:px-7">
        {photo && <>
          <Image key={photo.image} src={photo.image} alt="" fill unoptimized loading="eager" className="-z-20 object-cover object-[center_48%]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-airline-night via-airline-night/75 to-airline-night/35" aria-hidden="true" />
        </>}
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-airline-gold">{t("flightSearch.results.eyebrow")}</p>
            <h2 id="results-title" className="mt-1 flex items-center gap-3 font-serif text-3xl tracking-tight sm:text-4xl">{origin}<ArrowRight size={20} className="text-airline-gold" aria-hidden="true" />{destination}</h2>
          </div>
          <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/40 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"><ArrowLeft size={14} aria-hidden="true" />{t("flightSearch.booking.backToSearch")}</button>
        </div>
        <p className="mt-2 text-sm text-white/90">{t("flightSearch.results.searchSummary", { passengers: result.passengers, passengerLabel: t(result.passengers === 1 ? "flightSearch.fields.adult" : "flightSearch.fields.adults"), cabinClass: t("flightSearch.fields." + (result.cabin_class === "premium-economy" ? "premiumEconomy" : result.cabin_class)) })}</p>
        {photo && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <DestinationCountry photo={photo} locale={locale} />
          <DestinationPhotoCredit photo={photo} />
        </div>}
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="flex shrink-0 gap-2 rounded-2xl border border-airline-line bg-airline-paper p-1.5">
            {legs.map((item) => (
              <button key={item.id} type="button" aria-pressed={leg === item.id} onClick={() => setLeg(item.id)}
                className={`flex min-h-11 min-w-0 flex-1 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-xl px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest ${leg === item.id ? "bg-airline-forest text-white" : "text-airline-night hover:bg-airline-canvas"}`}>
                <span className="font-semibold">{item.label}</span><span className="text-xs">{formatDate(locale, item.date)}</span>
              </button>
            ))}
          </div>
          <div className="min-h-0 space-y-2 lg:overflow-y-auto lg:px-1 lg:pb-2">
            <h3 className="px-1 text-sm font-semibold text-airline-night">{legs[isReturn ? 1 : 0].instruction}</h3>
            {flights.length ? flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} locale={locale} origin={origin} destination={destination}
                selected={flight.id === (isReturn ? inbound : outbound)?.id}
                perPassengerLabel={t("flightSearch.results.perAdult")}
                onSelect={() => isReturn ? setInbound(flight) : setOutbound(flight)} />
            )) : <p className="rounded-2xl border border-dashed border-airline-line bg-airline-paper p-5 text-sm text-airline-muted">{t("flightSearch.results.noFlights")}</p>}
          </div>
        </div>

        <aside className="min-h-0 rounded-[24px] border border-airline-line bg-airline-paper p-4 shadow-sm lg:self-start lg:max-h-full lg:overflow-y-auto sm:p-5">
          <dl className="space-y-3">
            {legs.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 border-b border-airline-line pb-3">
                <dt className="text-sm font-semibold text-airline-night">{item.label}<span className="mt-1 block text-xs font-normal text-airline-muted">{formatDate(locale, item.date)}</span></dt>
                <dd className="text-right text-sm text-airline-night">{item.flight ? <><strong>{item.flight.flight_number}</strong><span className="mt-1 block text-xs text-airline-muted">{item.flight.departure} → {item.flight.arrival}</span></> : "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 space-y-3 pr-16">
            {total && <p className="text-lg font-semibold text-airline-night" role="status">{t("flightSearch.results.estimatedTotal", { total })}</p>}
            <button type="button" disabled={!total || bookingBusy || Boolean(booking)}
              onClick={() => { if (outbound) onBook(outbound.id, inbound?.id, outbound.fare_minor, inbound?.fare_minor); }}
              className="min-h-11 w-full rounded-xl bg-airline-garnet px-4 py-3 text-sm font-semibold text-white hover:bg-[#722136] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet disabled:cursor-not-allowed disabled:opacity-50">
              {bookingBusy ? t("flightSearch.booking.saving") : isAuthenticated ? t("flightSearch.booking.saveDemo") : t("flightSearch.booking.signInToSave")}
            </button>
          {bookingError && <p className="mt-3 text-sm text-[#b42318]" role="alert">{bookingError}</p>}
          {booking && <div className="mt-3 space-y-1 text-sm text-airline-forest">
            <p className="font-semibold" role="status">{t("flightSearch.booking.saved", { reference: booking.bookingReference.replace(/^DEMO-/i, "AI-") })}</p>
            <Link href="/my-trips" className="underline underline-offset-2">{t("flightSearch.booking.myTrips")}</Link>
          </div>}
          <p className="mt-3 text-xs leading-relaxed text-airline-muted">{result.is_mock ? t("flightSearch.results.mockNotice") : result.notice}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
