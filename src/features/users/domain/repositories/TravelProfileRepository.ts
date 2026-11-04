import type { Either } from "fp-ts/Either";
import type { TravelProfile, UpdateTravelProfileCommand } from "../models/TravelProfile";

export interface TravelProfileRepository {
  get(userId: string): Promise<Either<string, TravelProfile>>;
  save(userId: string, profile: UpdateTravelProfileCommand): Promise<Either<string, TravelProfile>>;
}
