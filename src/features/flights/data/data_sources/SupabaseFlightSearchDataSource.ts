import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { FlightSearchQuery } from "../../domain/models/FlightSearch";
import { FlightSearchDataSource } from "./FlightSearchDataSource";
import { FlightSearchModel } from "../models/FlightSearchModel";
import type { AmadeusFlightOfferModel } from "../models/AmadeusFlightOfferModel";

type AirportRow = { code: string; city: string; name: string; time_zone: string };
type FlightRow = {
  id: string;
  flight_number: string;
  origin_code: string;
  destination_code: string;
  departure_date: string;
  departure_at: string;
  arrival_at: string;
  duration_minutes: number;
  is_demo: boolean;
  source_label: string;
  origin_airport: AirportRow;
  destination_airport: AirportRow;
};
type InventoryRow = {
  flight_instance_id: string;
  cabin_class: string;
  seats_available: number;
  fare_minor: number;
  currency: string;
  offer_id: string;
  offer_payload: AmadeusFlightOfferModel;
  flight: FlightRow;
};

function formatTime(timestamp: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
}

function formatLocalDate(timestamp: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function mapFlight(row: InventoryRow) {
  const flight = row.flight;
  const offer = row.offer_payload;
  const segment = offer.itineraries[0]?.segments[0];
  const minutes = flight.duration_minutes;
  const offerFareMinor = Math.round(Number(offer.price.total) * 100);
  return {
    offer_id: row.offer_id,
    id: flight.id,
    flight_number: `${segment?.carrierCode ?? "AI"} ${segment?.number ?? flight.flight_number.split(" ").at(-1)}`,
    departure: formatTime(segment?.departure.at ?? flight.departure_at, flight.origin_airport.time_zone),
    arrival: formatTime(segment?.arrival.at ?? flight.arrival_at, flight.destination_airport.time_zone),
    duration: offer.itineraries[0]?.duration?.replace(/^PT/, "").replace("H", "h ").replace("M", "m") ?? `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
    departure_date: flight.departure_date,
    arrival_date: formatLocalDate(flight.arrival_at, flight.destination_airport.time_zone),
    fare_minor: Number.isFinite(offerFareMinor) ? offerFareMinor : row.fare_minor,
    currency: offer.price.currency || row.currency,
    number_of_bookable_seats: offer.numberOfBookableSeats,
    is_demo: Boolean(offer.isDemo || flight.is_demo),
    source_label: offer.sourceLabel || flight.source_label,
  };
}

export const SupabaseFlightSearchDataSourceImpl = (
  supabase: SupabaseClient,
): FlightSearchDataSource => ({
  search: async (query: FlightSearchQuery): Promise<FlightSearchModel> => {
    const getFlights = async (origin: string, destination: string, date: string) => {
      const { data, error } = await supabase
        .from("flight_inventory")
        .select(`
          flight_instance_id,cabin_class,seats_available,fare_minor,currency,offer_id,offer_payload,
          flight:flight_instances!inner(
            id,flight_number,origin_code,destination_code,departure_date,departure_at,arrival_at,duration_minutes,is_demo,source_label,
            origin_airport:airports!flight_instances_origin_code_fkey(code,city,name,time_zone),
            destination_airport:airports!flight_instances_destination_code_fkey(code,city,name,time_zone)
          )
        `)
        .eq("cabin_class", query.cabinClass)
        .gte("seats_available", query.passengers)
        .eq("flight.origin_code", origin)
        .eq("flight.destination_code", destination)
        .eq("flight.departure_date", date)
        .eq("flight.status", "scheduled");

      if (error) throw error;
      return ((data ?? []) as unknown as InventoryRow[])
        .sort((a, b) => a.flight.departure_at.localeCompare(b.flight.departure_at))
        .map(mapFlight);
    };

    const [outbound, inbound] = await Promise.all([
      getFlights(query.origin, query.destination, query.departureDate),
      query.returnDate
        ? getFlights(query.destination, query.origin, query.returnDate)
        : Promise.resolve([]),
    ]);

    return {
      origin: query.origin,
      destination: query.destination,
      departure_date: query.departureDate,
      return_date: query.returnDate ?? null,
      passengers: query.passengers,
      cabin_class: query.cabinClass,
      is_mock: true,
      notice: "Database-backed demo inventory. These fares and seats are not live or ticketable.",
      flights: outbound,
      return_flights: inbound,
    };
  },
});
