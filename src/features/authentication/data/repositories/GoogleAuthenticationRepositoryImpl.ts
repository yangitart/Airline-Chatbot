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
  currentUser: async () => {
    try {
      const user = await dataSource.currentUser();
      return SuccessData(user ? mapGoogleUser(user) : null);
    } catch (error) {
      return ErrorData(error);
    }
  },
  onAuthStateChange: (listener) => dataSource.onAuthStateChange((model) => listener(model ? mapGoogleUser(model) : null)),
  signOut: async () => {
    try {
      await dataSource.signOut();
      return SuccessData(undefined);
    } catch (error) {
      return ErrorData(error);
    }
  },
});
