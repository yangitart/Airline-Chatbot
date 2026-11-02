export type FlightSearchQuery = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
};

export type FlightOption = {
  flight_number: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
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
};
