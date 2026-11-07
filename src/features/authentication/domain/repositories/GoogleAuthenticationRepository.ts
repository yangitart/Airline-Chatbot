import { Either } from "fp-ts/Either";
import { GoogleUser } from "../models/GoogleUser";

export type GoogleAuthStateListener = (user: GoogleUser | null) => void;

export interface GoogleAuthenticationRepository {
  signIn(): Promise<Either<string, string>>;
  currentUser(): Promise<Either<string, GoogleUser | null>>;
  onAuthStateChange(listener: GoogleAuthStateListener): () => void;
  signOut(): Promise<Either<string, void>>;
}
