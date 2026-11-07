import { isLeft } from "fp-ts/Either";
import type {
  Booking,
  BookedOfferSnapshot,
} from "@/src/features/bookings/domain/models/Booking";
import {
  displayBookingReference,
  parseBookingLookup,
} from "@/src/features/bookings/domain/models/BookingReference";
import type { getMyBookingUseCase } from "@/src/features/bookings/domain/useCases/getMyBookingUseCase";
import type { listMyBookingsUseCase } from "@/src/features/bookings/domain/useCases/listMyBookingsUseCase";
import { parseFlightStatusQuery } from "@/src/features/flights/domain/models/FlightStatusLookup";
import type { lookupFlightStatusUseCase } from "@/src/features/flights/domain/useCases/lookupFlightStatusUseCase";
import type { ChatTool } from "../../domain/models/ChatTool";

function parseArguments(json: string): Record<string, unknown> | null {
  try {
    const args: unknown = JSON.parse(json);
    return args && typeof args === "object" && !Array.isArray(args)
      ? (args as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function summarizeLeg(offer: BookedOfferSnapshot | null) {
  const segments = offer?.itineraries[0]?.segments;
  const first = segments?.[0];
  const last = segments?.at(-1);
  if (!first || !last) return undefined;
  return {
    route: `${first.departure.iataCode} → ${last.arrival.iataCode}`,
    flightNumber: `${first.carrierCode} ${first.number}`,
    departureAt: first.departure.at,
    arrivalAt: last.arrival.at,
  };
}

function airportTimeZone(payload: unknown, leg: "departure" | "arrival") {
  if (!payload || typeof payload !== "object") return;
  const stop = (payload as Record<string, unknown>)[leg];
  if (!stop || typeof stop !== "object" || !("timezone" in stop)) return;
  return typeof stop.timezone === "string" ? stop.timezone : undefined;
}

function bookingResult(
  bookings: Booking[],
  hasMore = false,
): Awaited<ReturnType<ChatTool["execute"]>> {
  if (!bookings.length) return { modelResult: { bookings: [] } };
  const trips = bookings.map((booking) => {
    const outbound = summarizeLeg(booking.itinerarySnapshot.outbound);
    return {
      id: booking.id,
      reference: displayBookingReference(booking.bookingReference),
      outbound,
      return: summarizeLeg(booking.itinerarySnapshot.return),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalFareMinor: booking.totalFareMinor,
      currency: booking.currency,
      checkedInLegs: booking.checkIns.map(({ flightLeg }) => flightLeg),
    };
  });

  return {
    action: {
      type: "booking_results",
      data: trips.map(({ id, reference, outbound }) => ({
        id,
        reference,
        route: outbound?.route,
        departureAt: outbound?.departureAt,
      })),
    },
    modelResult: {
      bookings: trips.map(({ id: _id, ...trip }) => trip),
      hasMore,
    },
  };
}

export function createBookingLookupTool(bookings: {
  listMyBookings: ReturnType<typeof listMyBookingsUseCase>;
  getMyBooking: ReturnType<typeof getMyBookingUseCase>;
}): ChatTool {
  return {
    definition: {
      name: "find_my_bookings",
      description:
        "Read the signed-in traveler's bookings to help them manage a trip, check payment or check-in status, pay for a saved trip, or check in. Use the exact booking reference if supplied, otherwise list recent bookings so the traveler can pick one. The card opens fresh booking details and offers eligible actions for the traveler to confirm.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          reference: {
            type: "string",
            description:
              "Exact booking reference from the conversation, such as AI-AB12CD34EF. Omit if the traveler has not identified a booking.",
          },
        },
      },
    },
    async execute(json) {
      const args = parseArguments(json);
      if (!args) return { modelResult: { error: "invalid_booking_query" } };
      if (args.reference !== undefined) {
        const reference = args.reference;
        if (typeof reference !== "string" || !parseBookingLookup(reference)) {
          return { modelResult: { error: "invalid_booking_reference" } };
        }
        const result = await bookings.getMyBooking.execute(reference);
        if (isLeft(result))
          return { modelResult: { error: "booking_load_failed" } };
        return result.right
          ? bookingResult([result.right])
          : { modelResult: { error: "booking_not_found" } };
      }
      const result = await bookings.listMyBookings.execute();
      if (isLeft(result))
        return { modelResult: { error: "booking_load_failed" } };
      const limit = 6;
      return bookingResult(
        result.right.slice(0, limit),
        result.right.length > limit,
      );
    },
  };
}

export function createFlightStatusTool(
  lookup: ReturnType<typeof lookupFlightStatusUseCase>,
): ChatTool {
  return {
    definition: {
      name: "lookup_flight_status",
      description:
        "Look up a stored flight status when the traveler asks about a specific flight and date. Ask for missing flight number or date. These records describe the demo schedule.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          flight_number: {
            type: "string",
            description: "Flight number, such as AI 101.",
          },
          date: {
            type: "string",
            description: "Date of the flight in YYYY-MM-DD format.",
          },
        },
        required: ["flight_number", "date"],
      },
    },
    async execute(json) {
      const args = parseArguments(json);
      const query = parseFlightStatusQuery(args?.flight_number, args?.date);
      if (!query) return { modelResult: { error: "invalid_status_query" } };
      const result = await lookup.execute(query);
      if (isLeft(result))
        return { modelResult: { error: "status_unavailable" } };
      if (!result.right) return { modelResult: { error: "status_not_found" } };
      const {
        flightNumber,
        flightDate,
        status,
        isDemo,
        updatedAt,
        schedule,
        payload,
      } = result.right;
      const data = {
        flightNumber,
        flightDate,
        status,
        isDemo,
        updatedAt,
        schedule,
        departureTimeZone: airportTimeZone(payload, "departure"),
        arrivalTimeZone: airportTimeZone(payload, "arrival"),
      };
      return {
        action: { type: "flight_status_result", data },
        modelResult: data,
      };
    },
  };
}
