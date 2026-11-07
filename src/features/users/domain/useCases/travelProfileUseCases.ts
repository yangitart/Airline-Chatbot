import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type {
  TravelProfile,
  UpdateTravelProfileCommand,
} from "../models/TravelProfile";
import type { TravelProfileRepository } from "../repositories/TravelProfileRepository";

export const getTravelProfileUseCase = (
  repository: TravelProfileRepository,
): IUseCase<string, Promise<Either<string, TravelProfile>>> => ({
  execute: (userId) => repository.get(userId),
});

export const updateTravelProfileUseCase = (
  repository: TravelProfileRepository,
): IUseCase<
  { userId: string; profile: UpdateTravelProfileCommand },
  Promise<Either<string, TravelProfile>>
> => ({
  execute: ({ userId, profile }) => repository.save(userId, profile),
});
