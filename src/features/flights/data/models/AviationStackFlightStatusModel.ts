/** AviationStack flight record shape used for seeded status snapshots. */
export type AviationStackFlightStatusModel = {
  flight_date: string;
  flight_status:
    | "scheduled"
    | "active"
    | "landed"
    | "cancelled"
    | "incident"
    | "diverted";
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  airline: { name: string; iata: string; icao: string };
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared: null | Record<string, unknown>;
  };
  aircraft: {
    registration: string | null;
    iata: string;
    icao: string;
    icao24: string | null;
  } | null;
  live: null | Record<string, unknown>;
  isDemo: boolean;
};
