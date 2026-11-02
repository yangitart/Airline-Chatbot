import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import { FlightSearchQuery, FlightSearchResult } from "../models/FlightSearch";
import { FlightSearchRepository } from "../repositories/FlightSearchRepository";

export type SearchFlightsResponse = Promise<Either<string, FlightSearchResult>>;

export const searchFlightsUseCase = (
  repository: FlightSearchRepository,
): IUseCase<FlightSearchQuery, SearchFlightsResponse> => ({
  execute: (query) => repository.search(query),
});
