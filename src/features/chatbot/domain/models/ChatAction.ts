import type { FlightSearchResult } from "@/src/features/flights/domain/models/FlightSearch";
import type { FlightStatusLookup } from "@/src/features/flights/domain/models/FlightStatusLookup";

export type ChatBookingChoice = {
  id: string;
  reference: string;
  route?: string;
  departureAt?: string;
};

export const MAX_CHAT_ACTIONS = 4;

type ChatFlightStatus = Pick<FlightStatusLookup, "flightNumber" | "flightDate" | "status" | "isDemo" | "updatedAt" | "schedule"> & {
  departureTimeZone?: string;
  arrivalTimeZone?: string;
};

export type ChatActionResult =
  | { type: "flight_search_results"; actionId: string; data: FlightSearchResult }
  | { type: "booking_results"; data: ChatBookingChoice[] }
  | { type: "flight_status_result"; data: ChatFlightStatus };

export type ChatAction = ChatActionResult | { type: "action_group"; data: ChatActionResult[] };
