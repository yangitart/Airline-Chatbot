import { isLeft } from "fp-ts/Either";
import type {
  FlightSearchQuery,
  FlightSearchResult,
} from "@/src/features/flights/domain/models/FlightSearch";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { ChatToolDefinition } from "../../domain/models/ChatMessage";

type SearchFlightsUseCase = IUseCase<
  FlightSearchQuery,
  Promise<import("fp-ts/Either").Either<string, FlightSearchResult>>
>;

export const searchFlightsToolDefinition: ChatToolDefinition = {
  name: "search_flights",
  description:
    "Search Veyra's available flight inventory when the traveler asks to find or compare flights. Only call once the origin and destination IATA airport codes and departure date are clear. Ask a short follow-up question instead of guessing missing route or date details.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      origin: {
        type: "string",
        description:
          "Three-letter IATA code for the departure airport, such as DEL.",
      },
      destination: {
        type: "string",
        description:
          "Three-letter IATA code for the arrival airport, such as BOM.",
      },
      departure_date: {
        type: "string",
        description: "Departure date in YYYY-MM-DD format.",
      },
      return_date: {
        type: "string",
        description: "Optional return date in YYYY-MM-DD format.",
      },
      passengers: { type: "integer", minimum: 1, maximum: 9, default: 1 },
      cabin_class: {
        type: "string",
        enum: ["economy", "premium-economy", "business", "first"],
        default: "economy",
      },
    },
    required: ["origin", "destination", "departure_date"],
  },
};

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseQuery(value: unknown): {
  query?: FlightSearchQuery;
  error?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { error: "invalid_search_details" };
  const args = value as Record<string, unknown>;
  const origin =
    typeof args.origin === "string" ? args.origin.trim().toUpperCase() : "";
  const destination =
    typeof args.destination === "string"
      ? args.destination.trim().toUpperCase()
      : "";
  const departureDate =
    typeof args.departure_date === "string" ? args.departure_date : "";
  const returnDate =
    typeof args.return_date === "string" && args.return_date
      ? args.return_date
      : undefined;
  const passengers = args.passengers === undefined ? 1 : args.passengers;
  const cabinClass =
    args.cabin_class === undefined ? "economy" : args.cabin_class;

  if (
    !/^[A-Z]{3}$/.test(origin) ||
    !/^[A-Z]{3}$/.test(destination) ||
    origin === destination
  )
    return { error: "ask_for_airport_codes" };
  if (
    !validDate(departureDate) ||
    (returnDate && (!validDate(returnDate) || returnDate < departureDate))
  )
    return { error: "ask_for_valid_travel_dates" };
  if (
    typeof passengers !== "number" ||
    !Number.isInteger(passengers) ||
    passengers < 1 ||
    passengers > 9
  )
    return { error: "ask_for_passenger_count" };
  if (
    typeof cabinClass !== "string" ||
    !["economy", "premium-economy", "business", "first"].includes(cabinClass)
  )
    return { error: "ask_for_cabin_class" };
  return {
    query: {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
    },
  };
}

export async function executeSearchFlightsTool(
  rawArguments: string,
  searchFlights: SearchFlightsUseCase,
) {
  let args: unknown;
  try {
    args = JSON.parse(rawArguments) as unknown;
  } catch {
    return { modelResult: { error: "invalid_search_details" } };
  }
  const parsed = parseQuery(args);
  if (!parsed.query) return { modelResult: { error: parsed.error } };

  try {
    const result = await searchFlights.execute(parsed.query);
    if (isLeft(result))
      return { modelResult: { error: "flight_search_unavailable" } };
    const action: FlightSearchResult = {
      ...result.right,
      flights: result.right.flights.slice(0, 5),
      return_flights: result.right.return_flights.slice(0, 5),
    };
    return {
      action: {
        type: "flight_search_results" as const,
        actionId: crypto.randomUUID(),
        data: action,
      },
      modelResult: {
        origin: action.origin,
        destination: action.destination,
        departure_date: action.departure_date,
        return_date: action.return_date,
        passengers: action.passengers,
        cabin_class: action.cabin_class,
        is_mock: action.is_mock,
        flights: action.flights.map(
          ({
            id,
            flight_number,
            departure,
            arrival,
            departure_date,
            arrival_date,
            fare_minor,
            currency,
          }) => ({
            id,
            flight_number,
            departure,
            arrival,
            departure_date,
            arrival_date,
            fare_minor,
            currency,
          }),
        ),
        return_flights: action.return_flights.map(
          ({
            id,
            flight_number,
            departure,
            arrival,
            departure_date,
            arrival_date,
            fare_minor,
            currency,
          }) => ({
            id,
            flight_number,
            departure,
            arrival,
            departure_date,
            arrival_date,
            fare_minor,
            currency,
          }),
        ),
      },
    };
  } catch {
    return { modelResult: { error: "flight_search_unavailable" } };
  }
}
