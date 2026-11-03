"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import type { FlightOption, FlightSearchResult } from "../../domain/models/FlightSearch";

function FlightCard({
  flight,
  selected,
  locale,
  seatDescription,
  perPassengerLabel,
  sourceLabel,
  onSelect,
}: {
  flight: FlightOption;
  selected: boolean;
  locale: string;
  seatDescription: string;
  perPassengerLabel: string;
  sourceLabel: string;
  onSelect: () => void;
}) {
  const fare = new Intl.NumberFormat(locale, { style: "currency", currency: flight.currency }).format(flight.fare_minor / 100);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`grid w-full grid-cols-[1fr_.8fr_1fr_.9fr_auto] items-center gap-3 border-b border-[#edf0f2] p-4 text-left last:border-0 hover:bg-[#faf8f3] max-[650px]:grid-cols-2 ${selected ? "bg-[#f8f3e9] ring-2 ring-inset ring-[#86233d]" : "bg-white"}`}
    >
      <span><strong className="block text-base text-[#17283b]">{flight.flight_number}</strong><small className="text-xs text-[#737b84]">{seatDescription}</small><small className="block text-[11px] text-[#755f34]">{sourceLabel}</small></span>
      <span><strong className="block">{flight.departure}</strong><small className="text-xs text-[#737b84]">{flight.departure_date}</small></span>
      <span className="text-center text-sm text-[#65707c] max-[650px]:hidden">{flight.duration}</span>
      <span><strong className="block">{flight.arrival}</strong><small className="text-xs text-[#737b84]">{flight.arrival_date}</small></span>
      <span className="text-right font-semibold text-[#17283b] max-[650px]:text-left">{fare}<small className="block text-xs font-normal text-[#737b84]">{perPassengerLabel}</small></span>
    </button>
  );
}

export function FlightResults({
  result,
  isAuthenticated,
  bookingBusy,
  booking,
  bookingError,
  onBook,
}: {
  result: FlightSearchResult;
  isAuthenticated: boolean;
  bookingBusy: boolean;
  booking: Booking | null;
  bookingError: string;
  onBook: (flightInstanceId: string, returnFlightInstanceId: string | undefined, expectedOutboundFareMinor: number, expectedReturnFareMinor?: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const [outboundId, setOutboundId] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const locale = i18n.resolvedLanguage ?? "en";
  const outbound = result.flights.find((flight) => flight.id === outboundId) ?? null;
  const inbound = result.return_flights.find((flight) => flight.id === returnId) ?? null;
  const totalMinor = useMemo(() => {
    if (!outbound) return 0;
    return (outbound.fare_minor + (inbound?.fare_minor ?? 0)) * result.passengers;
  }, [inbound, outbound, result.passengers]);
  const total = outbound
    ? new Intl.NumberFormat(locale, { style: "currency", currency: outbound.currency }).format(totalMinor / 100)
    : "";
  const canBook = Boolean(outbound && (!result.return_date || inbound) && !bookingBusy && !booking);

  const renderFlights = (
    title: string,
    flights: FlightOption[],
    selectedId: string | null,
    setSelectedId: (id: string) => void,
  ) => (
    <section className="mt-5" aria-label={title}>
      <h3 className="mb-2 text-lg font-semibold text-[#17283b]">{title}</h3>
      {flights.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-[#65707c]">{t("flightSearch.results.noFlights")}</p>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-[#e6e8eb] bg-white">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} locale={locale} seatDescription={t("flightSearch.results.bookableSeats", { count: flight.number_of_bookable_seats })} perPassengerLabel={t("flightSearch.results.perAdult")} sourceLabel={flight.is_demo ? t("flightSearch.results.demoSource") : flight.source_label} selected={selectedId === flight.id} onSelect={() => setSelectedId(flight.id)} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <section className="mx-auto my-9 w-[min(96%,1500px)]" aria-live="polite" aria-labelledby="results-title">
      <div className="flex items-center justify-between gap-5 max-[650px]:items-start">
        <div>
          <span className="text-xs font-bold tracking-[.12em] text-[#b32025]">{t("flightSearch.results.eyebrow")}</span>
          <h2 className="my-[5px] text-[27px] text-[#242a33]" id="results-title">{result.origin} <span className="text-[#c8102e]" aria-hidden="true">→</span> {result.destination}</h2>
          <p className="my-1 text-[#68717c]">{new Date(`${result.departure_date}T12:00:00`).toLocaleDateString(locale)}</p>
          {result.return_date && <p className="my-1 text-[#68717c]">{t("flightSearch.fields.return")}: {new Date(`${result.return_date}T12:00:00`).toLocaleDateString(locale)}</p>}
          <p className="!mt-1 font-semibold !text-[#444]">{t("flightSearch.results.searchSummary", { passengers: result.passengers, cabinClass: t(`flightSearch.fields.${result.cabin_class === "premium-economy" ? "premiumEconomy" : result.cabin_class}`) })}</p>
        </div>
        <span className="max-w-[150px] rounded-full bg-[#f2ead6] px-[11px] py-2 text-center text-[11px] font-extrabold tracking-[.05em] text-[#6c5428]">{t("flightSearch.results.demoBadge")}</span>
      </div>
      <p className="mt-3 border-l-[3px] border-[#c4a466] bg-[#faf6ec] px-[13px] py-[10px] text-[13px] text-[#5f5238]">{result.is_mock ? t("flightSearch.results.mockNotice") : result.notice}</p>

      {renderFlights(t("flightSearch.results.outbound"), result.flights, outboundId, setOutboundId)}
      {result.return_date && renderFlights(t("flightSearch.results.return"), result.return_flights, returnId, setReturnId)}

      {outbound && (
        <div className="mt-5 rounded-xl border border-[#e8e0d3] bg-white p-4">
          {outbound && <p className="mb-3 font-semibold text-[#17283b]">{t("flightSearch.results.estimatedTotal", { total })}</p>}
          <button
            type="button"
            disabled={!canBook}
            onClick={() => outbound && onBook(outbound.id, inbound?.id, outbound.fare_minor, inbound?.fare_minor)}
            className="rounded-lg bg-[#86233d] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingBusy ? t("flightSearch.booking.saving") : isAuthenticated ? t("flightSearch.booking.saveDemo") : t("flightSearch.booking.signInToSave")}
          </button>
          {bookingError && <p className="mt-3 text-sm text-[#b42318]" role="alert">{bookingError}</p>}
          {booking && <p className="mt-3 text-sm font-semibold text-[#176b4d]" role="status">{t("flightSearch.booking.saved", { reference: booking.bookingReference })}</p>}
          <p className="mt-2 text-xs text-[#737b84]">{t("flightSearch.booking.demoOnly")}</p>
        </div>
      )}
    </section>
  );
}
