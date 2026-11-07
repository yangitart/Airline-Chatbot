import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { FlightSearchQuery } from "../domain/models/FlightSearch";
import type {
  FeaturedFlightsResponse,
  SearchFlightsResponse,
} from "../domain/useCases/searchFlightsUseCase";
import { injector } from "@/src/ioc/utils/injector";
import { FlightSearchSymbols } from "./FlightSearchSymbols";

export const flightSearchServices = {
  search: injector<IUseCase<FlightSearchQuery, SearchFlightsResponse>>(
    FlightSearchSymbols.searchUseCase,
  ),
  featured: injector<IUseCase<string, FeaturedFlightsResponse>>(
    FlightSearchSymbols.featuredFlightsUseCase,
  ),
};
