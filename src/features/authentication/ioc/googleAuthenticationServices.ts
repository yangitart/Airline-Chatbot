import type { Either } from "fp-ts/Either";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { GoogleUser } from "../domain/models/GoogleUser";
import type { GoogleAuthStateListener } from "../domain/repositories/GoogleAuthenticationRepository";
import { injector } from "@/src/ioc/utils/injector";
import { GoogleAuthenticationSymbols } from "./GoogleAuthenticationSymbols";

export const googleAuthenticationServices = {
  signIn: injector<IUseCase<void, Promise<Either<string, string>>>>(
    GoogleAuthenticationSymbols.signInUseCase,
  ),
  currentUser: injector<
    IUseCase<void, Promise<Either<string, GoogleUser | null>>>
  >(GoogleAuthenticationSymbols.currentUserUseCase),
  watchAuthState: injector<IUseCase<GoogleAuthStateListener, () => void>>(
    GoogleAuthenticationSymbols.authStateUseCase,
  ),
  signOut: injector<IUseCase<void, Promise<Either<string, void>>>>(
    GoogleAuthenticationSymbols.signOutUseCase,
  ),
};
