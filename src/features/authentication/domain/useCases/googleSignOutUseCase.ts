import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import { GoogleAuthenticationRepository } from "../repositories/GoogleAuthenticationRepository";

export const googleSignOutUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<void, Promise<Either<string, void>>> => ({
  execute: () => repository.signOut(),
});
