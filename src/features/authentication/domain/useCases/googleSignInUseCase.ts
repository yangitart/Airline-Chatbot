import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import { GoogleAuthenticationRepository } from "../repositories/GoogleAuthenticationRepository";

export const googleSignInUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<void, Promise<Either<string, string>>> => ({
  execute: () => repository.signIn(),
});
