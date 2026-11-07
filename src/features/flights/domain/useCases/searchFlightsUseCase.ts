import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import type { FeaturedFlight } from "../models/FeaturedFlight";
import { FlightSearchQuery, FlightSearchResult } from "../models/FlightSearch";
import { FlightSearchRepository } from "../repositories/FlightSearchRepository";

export type SearchFlightsResponse = Promise<Either<string, FlightSearchResult>>;
export type FeaturedFlightsResponse = Promise<Either<string, FeaturedFlight[]>>;

export const searchFlightsUseCase = (
  repository: FlightSearchRepository,
): IUseCase<FlightSearchQuery, SearchFlightsResponse> => ({
  execute: (query) => repository.search(query),
});

export const getFeaturedFlightsUseCase = (
  repository: FlightSearchRepository,
): IUseCase<string, FeaturedFlightsResponse> => ({
  execute: (departureDate) => repository.featuredFlights(departureDate),
});
