import type { Either } from "fp-ts/Either";
import type {
  FlightStatusLookup,
  FlightStatusLookupQuery,
} from "../models/FlightStatusLookup";

export interface FlightStatusRepository {
  find(
    query: FlightStatusLookupQuery,
  ): Promise<Either<string, FlightStatusLookup | null>>;
}
