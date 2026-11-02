import { isLeft } from "fp-ts/Either";
import { NextRequest, NextResponse } from "next/server";
import { FlightSearchQuery } from "@/src/features/flights/domain/models/FlightSearch";
import { createServerSearchFlights } from "@/src/features/flights/ioc/serverSearchFlights";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get("origin")?.trim().toUpperCase() ?? "";
  const destination = params.get("destination")?.trim().toUpperCase() ?? "";
  const departureDate = params.get("departure_date") ?? "";
  const returnDate = params.get("return_date") || undefined;
  const passengers = Number(params.get("passengers") ?? "1");
  const cabinClass = params.get("cabin_class") ?? "economy";

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json({ detail: "Origin and destination must be valid airport codes." }, { status: 400 });
  }
  if (origin === destination) {
    return NextResponse.json({ detail: "Choose different origin and destination cities." }, { status: 400 });
  }
  if (!isValidDate(departureDate)) {
    return NextResponse.json({ detail: "A valid departure date is required." }, { status: 400 });
  }
  if (returnDate && (!isValidDate(returnDate) || returnDate < departureDate)) {
    return NextResponse.json({ detail: "Return date must be on or after departure date." }, { status: 400 });
  }
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    return NextResponse.json({ detail: "Passenger count must be between 1 and 9." }, { status: 400 });
  }
  if (!["economy", "premium-economy", "business", "first"].includes(cabinClass)) {
    return NextResponse.json({ detail: "Choose a supported cabin class." }, { status: 400 });
  }

  const query: FlightSearchQuery = { origin, destination, departureDate, returnDate, passengers, cabinClass };
  const searchFlights = createServerSearchFlights();
  const result = await searchFlights.execute(query);

  if (isLeft(result)) {
    return NextResponse.json({ detail: result.left }, { status: 500 });
  }
  return NextResponse.json(result.right);
}
