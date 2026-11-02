export type FlightSearchModel = {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  passengers: number;
  cabin_class: string;
  is_mock: boolean;
  notice: string;
  flights: Array<{
    flight_number: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
  }>;
};
