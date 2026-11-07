import { left, right } from "fp-ts/Either";
import type { FlightStatusRepository } from "../../domain/repositories/FlightStatusRepository";
import type { FlightStatusLookup } from "../../domain/models/FlightStatusLookup";
import type { createSupabaseFlightStatusDataSource } from "../data_sources/SupabaseFlightStatusDataSource";

type DataSource = ReturnType<typeof createSupabaseFlightStatusDataSource>;
type FlightInstanceRow = {
  flight_number: string;
  origin_code: string;
  destination_code: string;
  departure_at: string;
  arrival_at: string;
};
type StatusRow = {
  flight_date: string;
  flight_status: string;
  provider: string;
  is_demo: boolean;
  fetched_at: string;
  status_payload: unknown;
  flight_instances: FlightInstanceRow | FlightInstanceRow[];
};
const mapStatus = (row: StatusRow): FlightStatusLookup => {
  const flight = Array.isArray(row.flight_instances)
    ? row.flight_instances[0]
    : row.flight_instances;
  if (!flight) throw new Error("flight_status_schedule_missing");
  return {
    flightNumber: flight.flight_number,
    flightDate: row.flight_date,
    status: row.flight_status,
    source: row.provider,
    isDemo: row.is_demo,
    updatedAt: row.fetched_at,
    payload: row.status_payload,
    schedule: {
      originCode: flight.origin_code,
      destinationCode: flight.destination_code,
      departureAt: flight.departure_at,
      arrivalAt: flight.arrival_at,
    },
  };
};
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "flight_status_unavailable";

export function FlightStatusRepositoryImpl(
  dataSource: DataSource,
): FlightStatusRepository {
  return {
    find: async ({ flightNumber, flightDate }) => {
      try {
        const row = await dataSource.findByNumberAndDate(
          flightNumber,
          flightDate,
        );
        return right(row ? mapStatus(row as StatusRow) : null);
      } catch (error) {
        return left(errorMessage(error));
      }
    },
  };
}
