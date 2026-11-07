import { FlightSearchResult } from "../../domain/models/FlightSearch";
import { FlightSearchModel } from "../models/FlightSearchModel";

export const mapFlightSearchModel = (
  model: FlightSearchModel,
): FlightSearchResult => ({
  origin: model.origin,
  destination: model.destination,
  departure_date: model.departure_date,
  return_date: model.return_date,
  passengers: model.passengers,
  cabin_class: model.cabin_class,
  is_mock: model.is_mock,
  notice: model.notice,
  flights: model.flights.map((flight) => ({ ...flight })),
  return_flights: model.return_flights.map((flight) => ({ ...flight })),
});
