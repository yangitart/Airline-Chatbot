import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type {
  GoogleAuthenticationRepository,
  GoogleAuthStateListener,
} from "../repositories/GoogleAuthenticationRepository";

export const watchGoogleAuthStateUseCase = (
  repository: GoogleAuthenticationRepository,
): IUseCase<GoogleAuthStateListener, () => void> => ({
  execute: (listener) => repository.onAuthStateChange(listener),
});
