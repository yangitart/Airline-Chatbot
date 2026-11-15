import FlightStatusView from "@/src/features/flights/ui/views/FlightStatusView";
import { parseFlightStatusQuery } from "@/src/features/flights/domain/models/FlightStatusLookup";

export default async function FlightStatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseFlightStatusQuery(params.flight_number, params.date);
  return (
    <FlightStatusView
      key={query ? `${query.flightNumber}:${query.flightDate}` : "default"}
      initialQuery={query}
    />
  );
}
