import type { AxiosInstance } from "axios";
import { API_ROUTES } from "@/src/core/routes/routes";
import { FlightSearchQuery } from "../../domain/models/FlightSearch";
import { FlightSearchModel } from "../models/FlightSearchModel";

export interface FlightSearchDataSource {
  search(query: FlightSearchQuery): Promise<FlightSearchModel>;
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
});
