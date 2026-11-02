import { FlightSearchQuery } from "../../domain/models/FlightSearch";
import { FlightSearchDataSource } from "./FlightSearchDataSource";
import { FlightSearchModel } from "../models/FlightSearchModel";

const demoSchedule = [
  { flight_number: "AI 865", departure: "06:00", arrival: "08:10", duration: "2h 10m", price: 4500 },
  { flight_number: "AI 677", departure: "09:30", arrival: "11:45", duration: "2h 15m", price: 5200 },
  { flight_number: "AI 863", departure: "14:15", arrival: "16:30", duration: "2h 15m", price: 4800 },
];

export const MockFlightSearchDataSource: FlightSearchDataSource = {
  async search(query: FlightSearchQuery): Promise<FlightSearchModel> {
    return {
      origin: query.origin.toUpperCase(),
      destination: query.destination.toUpperCase(),
      departure_date: query.departureDate,
      return_date: query.returnDate ?? null,
      passengers: query.passengers,
      cabin_class: query.cabinClass,
      is_mock: true,
      notice: "Demo flight data only. Schedules, availability, and prices are not live.",
      flights: demoSchedule.map((flight) => ({ ...flight })),
    };
  },
};
