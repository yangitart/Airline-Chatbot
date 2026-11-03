export type FlightSearchQuery = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
};

export type FlightOption = {
  offer_id: string;
  id: string;
  flight_number: string;
  departure: string;
  arrival: string;
  duration: string;
  departure_date: string;
  arrival_date: string;
  fare_minor: number;
  currency: string;
  number_of_bookable_seats: number;
  is_demo: boolean;
  source_label: string;
};

export type FlightSearchResult = {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  passengers: number;
  cabin_class: string;
  is_mock: boolean;
  notice: string;
  flights: FlightOption[];
  return_flights: FlightOption[];
};
