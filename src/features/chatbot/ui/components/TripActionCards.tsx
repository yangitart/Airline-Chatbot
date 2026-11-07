"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Booking } from "@/src/features/bookings/domain/models/Booking";
import { displayBookingReference } from "@/src/features/bookings/domain/models/BookingReference";
import type {
  ChatAction,
  ChatBookingChoice,
} from "../../domain/models/ChatAction";
import { ChatError } from "../../domain/models/ChatError";
import { TripOperationError } from "../../domain/repositories/ChatClient";
import { chatServices } from "../../ioc/chatServices";
import { FlightSearchActionCard } from "./FlightSearchActionCard";

type Confirmation = "checkout" | "outbound" | "return";

const panelClass =
  "mt-3 space-y-3 rounded-2xl border border-airline-line bg-white p-3 text-xs text-airline-night";
const buttonClass =
  "min-h-9 rounded-xl border border-airline-line px-3 py-2 text-left font-semibold text-airline-forest hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold disabled:opacity-60";
const confirmClass =
  "min-h-9 rounded-xl bg-airline-forest px-3 py-2 font-semibold text-white hover:bg-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold disabled:opacity-60";

function dateTime(value: string, locale: string, timeZone?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const options = { dateStyle: "medium", timeStyle: "short" } as const;
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(
      date,
    );
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

export function BookingActionCard({
  choices,
  onSignIn,
}: {
  choices: ChatBookingChoice[];
  onSignIn: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const client = chatServices.bookingClient;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function run(operation: (signal: AbortSignal) => Promise<void>) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setErrorKey("");
    try {
      await operation(controller.signal);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ChatError && error.code === "auth_required") {
        onSignIn();
        return;
      }
      if (error instanceof TripOperationError) {
        setErrorKey(
          error.code === "checkout_expired"
            ? "tripOperations.checkoutExpired"
            : `tripOperations.errors.${error.code}`,
        );
      } else {
        setErrorKey("tripOperations.genericError");
      }
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function openBooking(id: string) {
    void run(async (signal) => {
      setBooking(null);
      setConfirmation(null);
      const result = await client.getBooking(id, signal);
      if (!signal.aborted) setBooking(result);
    });
  }

  function confirm() {
    if (!booking || !confirmation) return;
    void run(async (signal) => {
      setConfirmation(null);
      if (confirmation === "checkout") {
        const url = await client.createCheckout(booking.id);
        if (!signal.aborted) window.location.assign(url);
        return;
      }
      const checkIn = await client.checkIn(booking.id, confirmation);
      if (!signal.aborted) {
        setBooking({
          ...booking,
          status: "checked_in",
          checkIns: [
            ...booking.checkIns.filter(
              ({ flightLeg }) => flightLeg !== checkIn.flightLeg,
            ),
            checkIn,
          ],
        });
      }
    });
  }

  const canPay =
    booking &&
    booking.paymentStatus !== "paid" &&
    ["demo_saved", "pending_payment", "failed"].includes(booking.status);
  const canCheckIn =
    booking?.paymentStatus === "paid" &&
    ["confirmed", "checked_in"].includes(booking.status);
  const total =
    booking &&
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: booking.currency,
    }).format(booking.totalFareMinor / 100);

  return (
    <section
      aria-label={t("flightSearch.booking.myTrips")}
      aria-busy={busy}
      className={panelClass}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t("flightSearch.booking.myTrips")}</h3>
        <Link
          href="/my-trips"
          className="font-semibold text-airline-forest underline underline-offset-2"
        >
          {t("chatbot.tripActions.allTrips")}
        </Link>
      </div>
      <div className="grid gap-2">
        {choices.map(({ id, reference, route, departureAt }) => (
          <button
            key={id}
            type="button"
            disabled={busy}
            onClick={() => openBooking(id)}
            aria-label={t("chatbot.tripActions.openBooking", { reference })}
            className={buttonClass}
          >
            <span className="block">
              {reference}
              {route ? ` · ${route}` : ""}
            </span>
            {departureAt && (
              <time
                className="mt-1 block font-normal text-airline-muted"
                dateTime={departureAt}
              >
                {dateTime(departureAt, locale)}
              </time>
            )}
          </button>
        ))}
      </div>
      {busy && (
        <p role="status" className="text-airline-muted">
          {t("tripOperations.working")}
        </p>
      )}
      {booking && (
        <div className="space-y-3 rounded-xl border border-airline-line p-3">
          <div className="space-y-1">
            <p className="font-semibold">
              {displayBookingReference(booking.bookingReference)}
            </p>
            <p>{t("chatbot.tripActions.bookingStates." + booking.status)}</p>
            <p>
              {t("tripOperations.payment")} ·{" "}
              {t(`tripOperations.paymentStates.${booking.paymentStatus}`)}
            </p>
            <p>
              {t("chatbot.totalFare")} · {total}
            </p>
          </div>
          {(["outbound", "return"] as const).map((leg) => {
            const offer = booking.itinerarySnapshot[leg];
            if (!offer) return null;
            const segments = offer.itineraries[0]?.segments;
            const first = segments?.[0];
            const last = segments?.at(-1);
            const checkIn = booking.checkIns.find(
              ({ flightLeg }) => flightLeg === leg,
            );
            return (
              <div
                key={leg}
                className="space-y-2 border-t border-airline-line pt-2"
              >
                <p className="font-semibold">
                  {t(`tripOperations.${leg}`)}
                  {first &&
                    last &&
                    ` · ${first.departure.iataCode} → ${last.arrival.iataCode}`}
                </p>
                {first && last && (
                  <dl className="grid grid-cols-2 gap-2">
                    <div>
                      <dt className="text-airline-muted">
                        {t("tripOperations.departure")}
                      </dt>
                      <dd>
                        <time dateTime={first.departure.at}>
                          {dateTime(first.departure.at, locale)}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-airline-muted">
                        {t("tripOperations.arrival")}
                      </dt>
                      <dd>
                        <time dateTime={last.arrival.at}>
                          {dateTime(last.arrival.at, locale)}
                        </time>
                      </dd>
                    </div>
                  </dl>
                )}
                {checkIn ? (
                  <p role="status" className="text-airline-forest">
                    {t("tripOperations.boardingPass", {
                      seat: checkIn.demoSeat,
                      reference: displayBookingReference(
                        checkIn.boardingPassReference,
                      ),
                    })}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-airline-muted">
                      {t("chatbot.tripActions.notCheckedIn")}
                    </span>
                    {canCheckIn && (
                      <button
                        type="button"
                        disabled={busy}
                        className={buttonClass}
                        onClick={() => setConfirmation(leg)}
                      >
                        {t("tripOperations.checkIn")} ·{" "}
                        {t(`tripOperations.${leg}`)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {canPay && (
            <button
              type="button"
              disabled={busy}
              className={buttonClass}
              onClick={() => setConfirmation("checkout")}
            >
              {t("tripOperations.payTest")}
            </button>
          )}
          {confirmation && (
            <div className="space-y-2 rounded-xl bg-airline-forest-soft p-3">
              <p>
                {confirmation === "checkout"
                  ? t("chatbot.tripActions.confirmPayment", {
                      total,
                      reference: displayBookingReference(
                        booking.bookingReference,
                      ),
                    })
                  : t("chatbot.tripActions.confirmCheckIn", {
                      leg: t(`tripOperations.${confirmation}`),
                      reference: displayBookingReference(
                        booking.bookingReference,
                      ),
                    })}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className={buttonClass}
                  onClick={() => setConfirmation(null)}
                >
                  {t("chatbot.cancel")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={confirmClass}
                  onClick={confirm}
                >
                  {t("chatbot.tripActions.confirm")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {errorKey && (
        <p role="alert" className="text-red-700">
          {t(errorKey)}
        </p>
      )}
    </section>
  );
}

export function FlightStatusActionCard({
  data,
}: {
  data: Extract<ChatAction, { type: "flight_status_result" }>["data"];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  return (
    <section
      aria-label={t("tripOperations.flightStatus")}
      className={panelClass}
    >
      <h3 className="font-semibold">
        {data.flightNumber} ·{" "}
        {t(`tripOperations.flightStates.${data.status}`, {
          defaultValue: data.status,
        })}
      </h3>
      <dl className="grid grid-cols-2 gap-2">
        <div>
          <dt className="font-semibold">
            {t("tripOperations.departure")} · {data.schedule.originCode}
          </dt>
          <dd>
            <time dateTime={data.schedule.departureAt}>
              {dateTime(
                data.schedule.departureAt,
                locale,
                data.departureTimeZone,
              )}
            </time>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">
            {t("tripOperations.arrival")} · {data.schedule.destinationCode}
          </dt>
          <dd>
            <time dateTime={data.schedule.arrivalAt}>
              {dateTime(data.schedule.arrivalAt, locale, data.arrivalTimeZone)}
            </time>
          </dd>
        </div>
      </dl>
      {data.isDemo && (
        <p className="text-airline-muted">
          {t("chatbot.tripActions.demoFlightRecord")}
        </p>
      )}
      <p className="text-airline-muted">
        {t("tripOperations.lastUpdated")} ·{" "}
        <time dateTime={data.updatedAt}>
          {dateTime(data.updatedAt, locale)}
        </time>
      </p>
    </section>
  );
}

export function ChatActionCards({
  action,
  isAuthenticated,
  onSignIn,
}: {
  action: ChatAction;
  isAuthenticated: boolean;
  onSignIn: () => void;
}) {
  const results = action.type === "action_group" ? action.data : [action];
  return results.map((result, index) => {
    const key = `${result.type}-${index}`;
    switch (result.type) {
      case "flight_search_results":
        return (
          <FlightSearchActionCard
            key={result.actionId}
            actionId={result.actionId}
            result={result.data}
            isAuthenticated={isAuthenticated}
            onSignIn={onSignIn}
          />
        );
      case "booking_results":
        return isAuthenticated ? (
          <BookingActionCard
            key={key}
            choices={result.data}
            onSignIn={onSignIn}
          />
        ) : null;
      case "flight_status_result":
        return <FlightStatusActionCard key={key} data={result.data} />;
    }
  });
}
