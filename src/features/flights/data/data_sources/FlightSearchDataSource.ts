import type { AxiosInstance } from "axios";
import { API_ROUTES } from "@/src/core/routes/routes";
import type { FeaturedFlight } from "../../domain/models/FeaturedFlight";
import { FlightSearchQuery } from "../../domain/models/FlightSearch";
import { FlightSearchModel } from "../models/FlightSearchModel";

export interface FlightSearchDataSource {
  search(query: FlightSearchQuery): Promise<FlightSearchModel>;
  featuredFlights(departureDate: string): Promise<FeaturedFlight[]>;
}

export const FlightSearchApiDataSourceImpl = (
  apiClient: AxiosInstance,
): FlightSearchDataSource => ({
  search: async (query) => {
    const { data } = await apiClient.get<FlightSearchModel>(API_ROUTES.FLIGHT_SEARCH, {
      params: {
        origin: query.origin,
        destination: query.destination,
        departure_date: query.departureDate,
        return_date: query.returnDate || undefined,
        passengers: query.passengers,
        cabin_class: query.cabinClass,
      },
    });
    return data;
  },
  featuredFlights: async (departureDate) => {
    const { data } = await apiClient.get<{ flights: FeaturedFlight[] }>(API_ROUTES.FEATURED_FLIGHTS, {
      params: { departure_date: departureDate },
    });
    return data.flights;
  },
});
