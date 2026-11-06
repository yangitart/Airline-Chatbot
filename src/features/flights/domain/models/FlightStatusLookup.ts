export type FlightStatusLookupQuery = { flightNumber: string; flightDate: string };

export function parseFlightStatusQuery(number: unknown, date: unknown): FlightStatusLookupQuery | null {
  const flightNumber = typeof number === "string" ? /^AI\s*(\d{1,4})$/i.exec(number.trim()) : null;
  if (!flightNumber || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) return null;
  return { flightNumber: `AI ${flightNumber[1]}`, flightDate: date };
}

export type FlightStatusLookup = {
  flightNumber: string;
  flightDate: string;
  status: string;
  source: string;
  isDemo: boolean;
  updatedAt: string;
  payload: unknown;
  schedule: { originCode: string; destinationCode: string; departureAt: string; arrivalAt: string };
};
