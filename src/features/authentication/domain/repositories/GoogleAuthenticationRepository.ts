import { Either } from "fp-ts/Either";
import { GoogleUser } from "../models/GoogleUser";

export type GoogleAuthStateListener = (user: GoogleUser | null) => void;

export interface GoogleAuthenticationRepository {
  signIn(): Promise<Either<string, string>>;
  signInWithPassword(email: string, password: string): Promise<Either<string, void>>;
  signUpWithPassword(email: string, password: string): Promise<Either<string, boolean>>;
  requestPasswordReset(email: string): Promise<Either<string, void>>;
  updatePassword(password: string): Promise<Either<string, void>>;
  currentUser(): Promise<Either<string, GoogleUser | null>>;
  onAuthStateChange(listener: GoogleAuthStateListener): () => void;
  signOut(): Promise<Either<string, void>>;
}
