import { NextRequest } from "next/server";
import { isLeft } from "fp-ts/Either";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { createServerFeaturedFlights } from "@/src/features/flights/ioc/serverFeaturedFlights";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export async function GET(request: NextRequest) {
  const departureDate =
    request.nextUrl.searchParams.get("departure_date") ?? "";
  if (!isValidDate(departureDate)) {
    return jsonError("A valid departure date is required.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const featuredFlights =
    await createServerFeaturedFlights(supabase).execute(departureDate);
  if (isLeft(featuredFlights)) {
    return jsonError("Featured flights are temporarily unavailable.", 500);
  }

  return jsonResponse({ flights: featuredFlights.right });
}
