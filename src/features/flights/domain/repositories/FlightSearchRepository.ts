import { Either } from "fp-ts/Either";
import type { FeaturedFlight } from "../models/FeaturedFlight";
import { FlightSearchQuery, FlightSearchResult } from "../models/FlightSearch";

export interface FlightSearchRepository {
  search(query: FlightSearchQuery): Promise<Either<string, FlightSearchResult>>;
  featuredFlights(
    departureDate: string,
  ): Promise<Either<string, FeaturedFlight[]>>;
}
