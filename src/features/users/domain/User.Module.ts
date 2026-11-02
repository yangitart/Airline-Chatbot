import { ContainerModule, interfaces } from "inversify";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { UsersDataModuleSymbols } from "@/src/features/users/data/UsersDataModuleSymbols";
import { UserRepositoryImpl } from "@/src/features/users/data/repositories/UsersRepositoryImpl";
import {
  UsersDataSources,
  UsersDataSourcesImpl,
} from "@/src/features/users/data/data_sources/UsersDataSources";
import { UserRepository } from "./repositories/UsersRepository";

const initializeModule = (bind: interfaces.Bind) => {
  bind<UsersDataSources>(
    UsersDataModuleSymbols.USERS_DATA_SOURCE
  ).toConstantValue(
    applyDependencies(UsersDataSourcesImpl, [
      NetWorkDataModuleSymbols.REST_CLIENT,
    ])
  );

  bind<UserRepository>(UsersDataModuleSymbols.USERS_REPOSITORY).toConstantValue(
    applyDependencies(UserRepositoryImpl, [
      UsersDataModuleSymbols.USERS_DATA_SOURCE,
    ])
  );
};

export const UserModule = new ContainerModule(initializeModule);
