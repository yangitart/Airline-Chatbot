import type { FlightOption } from "@/src/features/flights/domain/models/FlightSearch";
import {
  MAX_CHAT_ACTIONS,
  type ChatAction,
  type ChatActionResult,
  type ChatBookingChoice,
} from "../../domain/models/ChatAction";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasStrings<Key extends string>(
  value: Record<string, unknown>,
  keys: readonly Key[],
): value is Record<Key, string> & Record<string, unknown> {
  return keys.every((key) => typeof value[key] === "string");
}

function isFlight(value: unknown): value is FlightOption {
  return (
    isRecord(value) &&
    hasStrings(value, [
      "offer_id",
      "id",
      "flight_number",
      "departure",
      "arrival",
      "duration",
      "departure_date",
      "arrival_date",
      "currency",
      "source_label",
    ]) &&
    /^[A-Z]{3}$/.test(value.currency) &&
    typeof value.fare_minor === "number" &&
    Number.isSafeInteger(value.fare_minor) &&
    value.fare_minor > 0 &&
    typeof value.number_of_bookable_seats === "number" &&
    typeof value.is_demo === "boolean"
  );
}

function isBookingChoice(value: unknown): value is ChatBookingChoice {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "reference"]) &&
    (value.route === undefined || typeof value.route === "string") &&
    (value.departureAt === undefined || typeof value.departureAt === "string")
  );
}

function readResult(value: unknown): ChatActionResult | undefined {
  if (!isRecord(value)) return;
  const { type, data } = value;
  if (type === "booking_results" && Array.isArray(data)) {
    const choices = data.slice(0, 6).filter(isBookingChoice);
    return choices.length ? { type, data: choices } : undefined;
  }
  if (!isRecord(data)) return;
  if (
    type === "flight_search_results" &&
    typeof value.actionId === "string" &&
    hasStrings(data, [
      "origin",
      "destination",
      "departure_date",
      "cabin_class",
      "notice",
    ]) &&
    (typeof data.return_date === "string" || data.return_date === null) &&
    typeof data.passengers === "number" &&
    Number.isInteger(data.passengers) &&
    data.passengers >= 1 &&
    data.passengers <= 9 &&
    typeof data.is_mock === "boolean" &&
    Array.isArray(data.flights) &&
    Array.isArray(data.return_flights)
  ) {
    const {
      origin,
      destination,
      departure_date,
      return_date,
      cabin_class,
      passengers,
      is_mock,
      notice,
    } = data;
    return {
      type,
      actionId: value.actionId,
      data: {
        origin,
        destination,
        departure_date,
        return_date,
        cabin_class,
        passengers,
        is_mock,
        notice,
        flights: data.flights.slice(0, 5).filter(isFlight),
        return_flights: data.return_flights.slice(0, 5).filter(isFlight),
      },
    };
  }
  if (
    type === "flight_status_result" &&
    hasStrings(data, ["flightNumber", "flightDate", "status", "updatedAt"]) &&
    typeof data.isDemo === "boolean" &&
    isRecord(data.schedule) &&
    hasStrings(data.schedule, [
      "originCode",
      "destinationCode",
      "departureAt",
      "arrivalAt",
    ])
  ) {
    const {
      flightNumber,
      flightDate,
      status,
      updatedAt,
      isDemo,
      schedule,
      departureTimeZone,
      arrivalTimeZone,
    } = data;
    return {
      type,
      data: {
        flightNumber,
        flightDate,
        status,
        updatedAt,
        isDemo,
        schedule,
        ...(typeof departureTimeZone === "string" ? { departureTimeZone } : {}),
        ...(typeof arrivalTimeZone === "string" ? { arrivalTimeZone } : {}),
      },
    };
  }
}

export function readChatAction(value: unknown): ChatAction | undefined {
  if (
    isRecord(value) &&
    value.type === "action_group" &&
    Array.isArray(value.data)
  ) {
    const results = value.data
      .slice(0, MAX_CHAT_ACTIONS)
      .map(readResult)
      .filter((result) => result !== undefined);
    return results.length > 1
      ? { type: "action_group", data: results }
      : results[0];
  }
  return readResult(value);
}
