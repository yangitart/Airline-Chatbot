import { Either } from "fp-ts/Either";
import { GoogleUser } from "../models/GoogleUser";

export interface GoogleAuthenticationRepository {
  signIn(): Promise<Either<string, string>>;
  currentUser(): Promise<Either<string, GoogleUser | null>>;
  signOut(): Promise<Either<string, void>>;
}
