import { Either } from "fp-ts/Either";
import { FlightSearchQuery, FlightSearchResult } from "../models/FlightSearch";

export interface FlightSearchRepository {
  search(query: FlightSearchQuery): Promise<Either<string, FlightSearchResult>>;
}
