import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { Either } from "fp-ts/Either";
import { GoogleAuthenticationRepository } from "../repositories/GoogleAuthenticationRepository";

export const googleSignInUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<void, Promise<Either<string, string>>> => ({
  execute: () => repository.signIn(),
});

export const emailSignInUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<{ email: string; password: string }, Promise<Either<string, void>>> => ({
  execute: ({ email, password }) => repository.signInWithPassword(email, password),
});

export const emailSignUpUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<{ email: string; password: string }, Promise<Either<string, boolean>>> => ({
  execute: ({ email, password }) => repository.signUpWithPassword(email, password),
});

export const requestPasswordResetUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<string, Promise<Either<string, void>>> => ({
  execute: (email) => repository.requestPasswordReset(email),
});

export const updatePasswordUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<string, Promise<Either<string, void>>> => ({
  execute: (password) => repository.updatePassword(password),
});
