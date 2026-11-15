export type FlightStatusLookupQuery = {
  flightNumber: string;
  flightDate: string;
};

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

export function getFlightStatusDate(instant: string, timeZone: string): string {
  let formatter = dateFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateFormatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(new Date(instant));
  const part = (type: "year" | "month" | "day") =>
    parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function parseFlightStatusQuery(
  number: unknown,
  date: unknown,
): FlightStatusLookupQuery | null {
  const flightNumber =
    typeof number === "string" ? /^AI\s*(\d{1,4})$/i.exec(number.trim()) : null;
  if (
    !flightNumber ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  )
    return null;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  )
    return null;
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
  schedule: {
    originCode: string;
    destinationCode: string;
    departureAt: string;
    arrivalAt: string;
  };
};
