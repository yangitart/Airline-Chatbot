import { ContainerModule, interfaces } from "inversify";
import { Either } from "fp-ts/Either";
import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";
import { GoogleUser } from "../domain/models/GoogleUser";
import { GoogleAuthenticationRepository } from "../domain/repositories/GoogleAuthenticationRepository";
import { googleSignInUseCase } from "../domain/useCases/googleSignInUseCase";
import { getGoogleCurrentUserUseCase } from "../domain/useCases/getGoogleCurrentUserUseCase";
import { watchGoogleAuthStateUseCase } from "../domain/useCases/watchGoogleAuthStateUseCase";
import { googleSignOutUseCase } from "../domain/useCases/googleSignOutUseCase";
import type { GoogleAuthStateListener } from "../domain/repositories/GoogleAuthenticationRepository";
import { GoogleAuthenticationDataSource, GoogleAuthenticationDataSourceImpl } from "../data/data_sources/GoogleAuthenticationDataSource";
import { GoogleAuthenticationRepositoryImpl } from "../data/repositories/GoogleAuthenticationRepositoryImpl";
import { GoogleAuthenticationSymbols } from "./GoogleAuthenticationSymbols";

const initializeModule = (bind: interfaces.Bind) => {
  bind<GoogleAuthenticationDataSource>(GoogleAuthenticationSymbols.dataSource).toConstantValue(
    applyDependencies(GoogleAuthenticationDataSourceImpl, [NetWorkDataModuleSymbols.SUPABASE_BROWSER_CLIENT_FACTORY]),
  );

  bind<GoogleAuthenticationRepository>(GoogleAuthenticationSymbols.repository).toConstantValue(
    applyDependencies(GoogleAuthenticationRepositoryImpl, [GoogleAuthenticationSymbols.dataSource]),
  );

  bind<IUseCase<void, Promise<Either<string, string>>>>(GoogleAuthenticationSymbols.signInUseCase).toConstantValue(
    applyDependencies(googleSignInUseCase, [GoogleAuthenticationSymbols.repository]),
  );

  bind<IUseCase<void, Promise<Either<string, GoogleUser | null>>>>(GoogleAuthenticationSymbols.currentUserUseCase).toConstantValue(
    applyDependencies(getGoogleCurrentUserUseCase, [GoogleAuthenticationSymbols.repository]),
  );

  bind<IUseCase<GoogleAuthStateListener, () => void>>(GoogleAuthenticationSymbols.authStateUseCase).toConstantValue(
    applyDependencies(watchGoogleAuthStateUseCase, [GoogleAuthenticationSymbols.repository]),
  );

  bind<IUseCase<void, Promise<Either<string, void>>>>(GoogleAuthenticationSymbols.signOutUseCase).toConstantValue(
    applyDependencies(googleSignOutUseCase, [GoogleAuthenticationSymbols.repository]),
  );
};

export const GoogleAuthenticationModule = new ContainerModule(initializeModule);
