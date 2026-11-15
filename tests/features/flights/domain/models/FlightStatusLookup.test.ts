import { expect, it } from "vitest";
import { getDemoAirportTimeZone } from "@/src/features/flights/domain/models/DemoRoutes";
import {
  getFlightStatusDate,
  parseFlightStatusQuery,
} from "@/src/features/flights/domain/models/FlightStatusLookup";

it("looks up a booked flight using the date at its departure airport", () => {
  const instant = "2026-11-14T20:00:00.000Z";
  const date = getFlightStatusDate(instant, getDemoAirportTimeZone("DEL")!);
  expect(parseFlightStatusQuery("ai101", date)).toEqual({
    flightNumber: "AI 101",
    flightDate: "2026-11-15",
  });
  expect(getFlightStatusDate(instant, getDemoAirportTimeZone("LHR")!)).toBe(
    "2026-11-14",
  );
});

it("rejects impossible dates and invalid flight numbers before lookup", () => {
  expect(parseFlightStatusQuery("AI 101", "2026-11-31")).toBeNull();
  expect(parseFlightStatusQuery("AI hello", "2026-11-14")).toBeNull();
});
