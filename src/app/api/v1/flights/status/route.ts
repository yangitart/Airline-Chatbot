import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { isLeft } from "fp-ts/Either";
import { createServerFlightStatus } from "@/src/features/flights/ioc/serverFlightStatus";
import { parseFlightStatusQuery } from "@/src/features/flights/domain/models/FlightStatusLookup";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";

export async function GET(request: NextRequest) {
  const query = parseFlightStatusQuery(
    request.nextUrl.searchParams.get("flight_number"),
    request.nextUrl.searchParams.get("date"),
  );
  if (!query) {
    return jsonError(
      "Enter a valid flight number and date.",
      422,
      "invalid_status_query",
    );
  }
  const supabase = await createSupabaseServerClient();
  const result = await createServerFlightStatus(supabase).execute(query);
  if (isLeft(result))
    return jsonError(
      "Flight status is temporarily unavailable.",
      500,
      "status_unavailable",
    );
  if (!result.right)
    return jsonError(
      "No flight status was found for that flight and date.",
      404,
      "status_not_found",
    );
  const status = result.right;
  return jsonResponse({
    flight_number: status.flightNumber,
    flight_date: status.flightDate,
    status: status.status,
    source: status.source,
    is_demo: status.isDemo,
    updated_at: status.updatedAt,
    payload: status.payload,
    schedule: {
      origin_code: status.schedule.originCode,
      destination_code: status.schedule.destinationCode,
      departure_at: status.schedule.departureAt,
      arrival_at: status.schedule.arrivalAt,
    },
  });
}
