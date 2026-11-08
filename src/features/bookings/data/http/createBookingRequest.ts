import type { CreateDemoBookingCommand } from "../../domain/models/Booking";
import {
  bookingUuidPattern,
  resolveBookingRequestKey,
} from "./bookingRequestKey";

const MAX_POSTGRES_INTEGER = 2_147_483_647;
const CABIN_CLASSES = ["economy", "premium-economy", "business", "first"];

type CreateBookingRequestResult =
  | { ok: true; command: CreateDemoBookingCommand; expectedTotal: number }
  | { ok: false; status: 400 | 422; detail: string };

export function parseCreateBookingRequest(
  input: unknown,
  headerRequestKey: string | null,
): CreateBookingRequestResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, status: 400, detail: "Invalid request body." };
  }

  const body = input as Record<string, unknown>;
  const flightInstanceId = body.flight_instance_id;
  const returnFlightInstanceId = body.return_flight_instance_id ?? undefined;
  const cabinClass = body.cabin_class;
  const passengerCount = body.passenger_count;
  const expectedOutboundFareMinor = body.expected_outbound_fare_minor;
  const expectedReturnFareMinor = body.expected_return_fare_minor ?? undefined;

  if (
    typeof flightInstanceId !== "string" ||
    !bookingUuidPattern.test(flightInstanceId) ||
    (returnFlightInstanceId !== undefined &&
      (typeof returnFlightInstanceId !== "string" ||
        !bookingUuidPattern.test(returnFlightInstanceId))) ||
    typeof cabinClass !== "string" ||
    !CABIN_CLASSES.includes(cabinClass) ||
    typeof passengerCount !== "number" ||
    !Number.isInteger(passengerCount) ||
    passengerCount < 1 ||
    passengerCount > 9 ||
    typeof expectedOutboundFareMinor !== "number" ||
    !Number.isInteger(expectedOutboundFareMinor) ||
    expectedOutboundFareMinor < 1 ||
    expectedOutboundFareMinor > MAX_POSTGRES_INTEGER ||
    (expectedReturnFareMinor !== undefined &&
      (typeof expectedReturnFareMinor !== "number" ||
        !Number.isInteger(expectedReturnFareMinor) ||
        expectedReturnFareMinor < 1 ||
        expectedReturnFareMinor > MAX_POSTGRES_INTEGER)) ||
    (returnFlightInstanceId === undefined) !==
      (expectedReturnFareMinor === undefined)
  ) {
    return {
      ok: false,
      status: 422,
      detail: "Choose a valid flight, cabin, passenger count, and fare.",
    };
  }

  const idempotencyKey = resolveBookingRequestKey(
    headerRequestKey ?? body.idempotency_key,
    flightInstanceId,
    returnFlightInstanceId,
  );
  if (!idempotencyKey) {
    return {
      ok: false,
      status: 422,
      detail: "Choose a valid booking request ID.",
    };
  }

  const expectedTotal =
    (expectedOutboundFareMinor + (expectedReturnFareMinor ?? 0)) *
    passengerCount;
  if (expectedTotal > MAX_POSTGRES_INTEGER) {
    return {
      ok: false,
      status: 422,
      detail: "The total fare is outside the supported range.",
    };
  }

  return {
    ok: true,
    expectedTotal,
    command: {
      flightInstanceId,
      returnFlightInstanceId,
      cabinClass,
      passengerCount,
      expectedOutboundFareMinor,
      expectedReturnFareMinor,
      idempotencyKey,
    },
  };
}

export function mapCreateBookingError(error: string) {
  if (error.includes("inventory_changed")) {
    return {
      status: 409,
      detail: "Availability changed. Search again before booking.",
    };
  }
  if (error.includes("fare_changed")) {
    return {
      status: 409,
      detail: "The fare changed. Review the current offer before booking.",
    };
  }
  if (error.includes("flight_unavailable")) {
    return { status: 404, detail: "That flight is no longer available." };
  }
  return { status: 500, detail: "The booking could not be saved." };
}
