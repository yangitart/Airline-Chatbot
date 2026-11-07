export type FlightStatusViewResult = {
  flight_number: string;
  flight_date: string;
  status: string;
  source: string;
  is_demo: boolean;
  updated_at: string;
  schedule: {
    origin_code: string;
    destination_code: string;
    departure_at: string;
    arrival_at: string;
  };
  payload: {
    departure?: {
      delay?: number | null;
      gate?: string | null;
      terminal?: string | null;
      timezone?: string;
    };
    arrival?: {
      delay?: number | null;
      gate?: string | null;
      terminal?: string | null;
      timezone?: string;
    };
  };
};
