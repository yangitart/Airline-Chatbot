import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import { GoogleUser } from "../models/GoogleUser";
import { GoogleAuthenticationRepository } from "../repositories/GoogleAuthenticationRepository";

export const getGoogleCurrentUserUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<void, Promise<Either<string, GoogleUser | null>>> => ({
  execute: () => repository.currentUser(),
});
