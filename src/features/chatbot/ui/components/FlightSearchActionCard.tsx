"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, Plane, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  FlightOption,
  FlightSearchResult,
} from "@/src/features/flights/domain/models/FlightSearch";
import { ChatError } from "../../domain/models/ChatError";
import { TripOperationError } from "../../domain/repositories/ChatClient";
import { chatServices } from "../../ioc/chatServices";

function money(locale: string, flight: FlightOption, passengers: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: flight.currency,
  }).format((flight.fare_minor * passengers) / 100);
}

function FlightChoice({
  flight,
  selected,
  locale,
  passengers,
  disabled,
  onSelect,
}: {
  flight: FlightOption;
  selected: boolean;
  locale: string;
  passengers: number;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={`w-full rounded-2xl border px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold disabled:cursor-not-allowed disabled:opacity-70 ${selected ? "border-airline-forest bg-airline-forest-soft" : "border-airline-line bg-white hover:border-airline-gold"}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-airline-muted">
          {flight.flight_number}
        </span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? "border-airline-forest bg-airline-forest text-white" : "border-airline-line text-airline-muted"}`}
          aria-hidden="true"
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </span>
      </span>
      <span className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span>
          <strong className="block text-lg tabular-nums text-airline-night">
            {flight.departure}
          </strong>
          <span className="text-[10px] text-airline-muted">
            {flight.departure_date}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 text-airline-gold" aria-hidden="true" />
        <span className="text-right">
          <strong className="block text-lg tabular-nums text-airline-night">
            {flight.arrival}
          </strong>
          <span className="text-[10px] text-airline-muted">
            {flight.arrival_date}
          </span>
        </span>
      </span>
      <span className="mt-2 flex items-baseline justify-between gap-2 border-t border-airline-line pt-2">
        <span className="text-[10px] text-airline-muted">
          {flight.duration}
        </span>
        <strong className="text-sm text-airline-forest">
          {money(locale, flight, passengers)}
        </strong>
      </span>
    </button>
  );
}

export function FlightSearchActionCard({
  actionId,
  result,
  isAuthenticated,
  onSignIn,
}: {
  actionId: string;
  result: FlightSearchResult;
  isAuthenticated: boolean;
  onSignIn: () => void;
}) {
  const { t, i18n } = useTranslation();
  const confirmTitleId = useId();
  const client = chatServices.bookingClient;
  const checkoutRequest = useRef<AbortController | null>(null);
  const [outbound, setOutbound] = useState<FlightOption | null>(null);
  const [returnFlight, setReturnFlight] = useState<FlightOption | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const hasReturn = Boolean(result.return_date);
  const sameCurrency =
    !outbound || !returnFlight || outbound.currency === returnFlight.currency;
  const canBook = Boolean(
    outbound && (!hasReturn || returnFlight) && sameCurrency,
  );
  const locale = i18n.resolvedLanguage ?? "en";
  const totalMinor =
    canBook && outbound
      ? (outbound.fare_minor + (returnFlight?.fare_minor ?? 0)) *
        result.passengers
      : 0;
  const currency = outbound?.currency ?? "USD";
  const total = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(totalMinor / 100);
  useEffect(() => () => checkoutRequest.current?.abort(), []);

  const createCheckout = async () => {
    if (!canBook || !outbound || checkoutRequest.current) return;
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    const controller = new AbortController();
    checkoutRequest.current = controller;
    setBusy(true);
    setError("");
    try {
      let currentBookingId = bookingId;
      if (!currentBookingId) {
        currentBookingId = await client.createBooking({
          flightInstanceId: outbound.id,
          returnFlightInstanceId: returnFlight?.id,
          cabinClass: result.cabin_class,
          passengerCount: result.passengers,
          expectedOutboundFareMinor: outbound.fare_minor,
          expectedReturnFareMinor: returnFlight?.fare_minor,
          idempotencyKey: `chat:${actionId}`,
        });
        if (controller.signal.aborted) return;
        setBookingId(currentBookingId);
      }

      const url = await client.createCheckout(currentBookingId);
      if (!controller.signal.aborted) window.location.assign(url);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ChatError && error.code === "auth_required") {
        onSignIn();
        return;
      }
      const key =
        error instanceof TripOperationError
          ? error.code === "checkout_expired"
            ? "tripOperations.checkoutExpired"
            : `tripOperations.errors.${error.code}`
          : "chatbot.checkoutError";
      setError(t(key));
      setConfirming(false);
    } finally {
      checkoutRequest.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <section
      className="w-full rounded-[22px] border border-airline-line bg-airline-canvas p-3 shadow-sm"
      aria-label={t("chatbot.flightResultsTitle")}
    >
      <div className="mb-3 flex items-start gap-2 border-b border-airline-line pb-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-airline-forest text-airline-gold">
          <Plane className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-airline-forest">
            {t("chatbot.flightResultsTitle")}
          </p>
          <p className="mt-1 text-sm font-semibold text-airline-night">
            {result.origin}{" "}
            <ArrowRight
              className="mx-1 inline h-3.5 w-3.5 text-airline-gold"
              aria-hidden="true"
            />{" "}
            {result.destination}
          </p>
          <p className="mt-0.5 text-[10px] text-airline-muted">
            {result.departure_date}
            {result.return_date ? ` · ${result.return_date}` : ""} ·{" "}
            {t("chatbot.passengers", { count: result.passengers })}
          </p>
        </div>
      </div>

      {!result.flights.length && (
        <p className="rounded-xl border border-dashed border-airline-line bg-white p-4 text-xs leading-5 text-airline-muted">
          {t("chatbot.noFlights")}
        </p>
      )}
      {result.flights.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold text-airline-night">
            {t("chatbot.outboundFlights")}
          </p>
          <div className="grid gap-2">
            {result.flights.map((flight) => (
              <FlightChoice
                key={flight.id}
                flight={flight}
                selected={outbound?.id === flight.id}
                locale={locale}
                passengers={result.passengers}
                disabled={busy || Boolean(bookingId)}
                onSelect={() => {
                  setOutbound(flight);
                  setConfirming(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
      {hasReturn && result.return_flights.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold text-airline-night">
            {t("chatbot.returnFlights")}
          </p>
          <div className="grid gap-2">
            {result.return_flights.map((flight) => (
              <FlightChoice
                key={flight.id}
                flight={flight}
                selected={returnFlight?.id === flight.id}
                locale={locale}
                passengers={result.passengers}
                disabled={busy || Boolean(bookingId)}
                onSelect={() => {
                  setReturnFlight(flight);
                  setConfirming(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
      {hasReturn && result.return_flights.length === 0 && (
        <p className="mt-3 rounded-xl border border-dashed border-airline-line bg-white p-3 text-xs text-airline-muted">
          {t("chatbot.noReturnFlights")}
        </p>
      )}

      {outbound && returnFlight && !sameCurrency && (
        <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-5 text-airline-muted">
          {t("chatbot.currencyMismatch")}
        </p>
      )}
      {canBook && (
        <div className="mt-4 border-t border-airline-line pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-airline-muted">
              {t("chatbot.totalFare")}
            </span>
            <strong className="text-base text-airline-night">{total}</strong>
          </div>
          {!confirming ? (
            <button
              type="button"
              onClick={() =>
                isAuthenticated ? setConfirming(true) : onSignIn()
              }
              className="mt-3 min-h-10 w-full rounded-xl bg-airline-forest px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold"
            >
              {t("chatbot.reviewCheckout")}
            </button>
          ) : (
            <div
              role="group"
              aria-labelledby={confirmTitleId}
              className="mt-3 rounded-2xl border border-airline-gold/50 bg-white p-3"
            >
              <h4
                id={confirmTitleId}
                className="text-sm font-semibold text-airline-night"
              >
                {t("chatbot.confirmCheckoutTitle")}
              </h4>
              <p className="mt-1 text-xs leading-5 text-airline-muted">
                {t("chatbot.confirmCheckoutDescription", { total })}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                  className="min-h-10 flex-1 rounded-xl border border-airline-line px-3 py-2 text-xs font-semibold text-airline-ink hover:bg-airline-canvas disabled:opacity-50"
                >
                  {t("chatbot.cancel")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void createCheckout()}
                  className="min-h-10 flex-1 rounded-xl bg-airline-forest px-3 py-2 text-xs font-semibold text-white hover:bg-airline-night disabled:opacity-50"
                >
                  {busy
                    ? t("chatbot.checkoutWorking")
                    : t("chatbot.createPaymentLink")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"
        >
          {error}
        </p>
      )}
      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-airline-muted">
        <ShieldCheck
          className="mt-0.5 h-3 w-3 shrink-0 text-airline-forest"
          aria-hidden="true"
        />
        {t("chatbot.flightSearchNotice")}
      </p>
    </section>
  );
}
