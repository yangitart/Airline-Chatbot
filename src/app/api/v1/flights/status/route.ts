import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { isLeft } from "fp-ts/Either";
import { createServerFlightStatus } from "@/src/features/flights/ioc/serverFlightStatus";
import { parseFlightStatusQuery } from "@/src/features/flights/domain/models/FlightStatusLookup";

export async function GET(request: NextRequest) {
  const query = parseFlightStatusQuery(request.nextUrl.searchParams.get("flight_number"), request.nextUrl.searchParams.get("date"));
  if (!query) {
    return NextResponse.json({ detail: "Enter a valid flight number and date.", error_code: "invalid_status_query" }, { status: 422 });
  }
  const supabase = await createSupabaseServerClient();
  const result = await createServerFlightStatus(supabase).execute(query);
  if (isLeft(result)) return NextResponse.json({ detail: "Flight status is temporarily unavailable.", error_code: "status_unavailable" }, { status: 500 });
  if (!result.right) return NextResponse.json({ detail: "No flight status was found for that flight and date.", error_code: "status_not_found" }, { status: 404 });
  const status = result.right;
  return NextResponse.json({
    flight_number: status.flightNumber, flight_date: status.flightDate, status: status.status,
    source: status.source, is_demo: status.isDemo, updated_at: status.updatedAt, payload: status.payload,
    schedule: { origin_code: status.schedule.originCode, destination_code: status.schedule.destinationCode, departure_at: status.schedule.departureAt, arrival_at: status.schedule.arrivalAt },
  });
}
