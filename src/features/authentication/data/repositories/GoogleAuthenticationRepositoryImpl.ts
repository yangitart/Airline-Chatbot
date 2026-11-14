import { ErrorData, SuccessData } from "@/src/core/api/errors/HandleResponse";
import { GoogleAuthenticationRepository } from "../../domain/repositories/GoogleAuthenticationRepository";
import { GoogleAuthenticationDataSource } from "../data_sources/GoogleAuthenticationDataSource";
import { mapGoogleUser } from "../mappers/GoogleUserMapper";

export const GoogleAuthenticationRepositoryImpl = (
  dataSource: GoogleAuthenticationDataSource,
): GoogleAuthenticationRepository => ({
  signIn: async () => {
    try {
      return SuccessData(await dataSource.signIn());
    } catch (error) {
      return ErrorData(error);
    }
  },
  signInWithPassword: async (email, password) => {
    try {
      await dataSource.signInWithPassword(email, password);
      return SuccessData(undefined);
    } catch (error) {
      return ErrorData(error);
    }
  },
  signUpWithPassword: async (email, password) => {
    try {
      return SuccessData(await dataSource.signUpWithPassword(email, password));
    } catch (error) {
      return ErrorData(error);
    }
  },
  requestPasswordReset: async (email) => {
    try {
      await dataSource.requestPasswordReset(email);
      return SuccessData(undefined);
    } catch (error) {
      return ErrorData(error);
    }
  },
  updatePassword: async (password) => {
    try {
      await dataSource.updatePassword(password);
      return SuccessData(undefined);
    } catch (error) {
      return ErrorData(error);
    }
  },
  currentUser: async () => {
    try {
      const user = await dataSource.currentUser();
      return SuccessData(user ? mapGoogleUser(user) : null);
    } catch (error) {
      return ErrorData(error);
    }
  },
  onAuthStateChange: (listener) =>
    dataSource.onAuthStateChange((model) =>
      listener(model ? mapGoogleUser(model) : null),
    ),
  signOut: async () => {
    try {
      await dataSource.signOut();
      return SuccessData(undefined);
    } catch (error) {
      return ErrorData(error);
    }
  },
});
