import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type {
  FlightStatusLookup,
  FlightStatusLookupQuery,
} from "../models/FlightStatusLookup";
import type { FlightStatusRepository } from "../repositories/FlightStatusRepository";

export const lookupFlightStatusUseCase = (
  repository: FlightStatusRepository,
): IUseCase<
  FlightStatusLookupQuery,
  Promise<Either<string, FlightStatusLookup | null>>
> => ({
  execute: (query) => repository.find(query),
});
