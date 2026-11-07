import { NextRequest, NextResponse } from "next/server";
import { isLeft } from "fp-ts/Either";
import { createSupabaseServerClient } from "@/src/core/api/supabase/server";
import { createServerFeaturedFlights } from "@/src/features/flights/ioc/serverFeaturedFlights";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function GET(request: NextRequest) {
  const departureDate = request.nextUrl.searchParams.get("departure_date") ?? "";
  if (!isValidDate(departureDate)) {
    return NextResponse.json({ detail: "A valid departure date is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const featuredFlights = await createServerFeaturedFlights(supabase).execute(departureDate);
  if (isLeft(featuredFlights)) {
    return NextResponse.json({ detail: "Featured flights are temporarily unavailable." }, { status: 500 });
  }

  return NextResponse.json({ flights: featuredFlights.right });
}
