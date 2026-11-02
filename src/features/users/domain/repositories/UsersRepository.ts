import { Either } from "fp-ts/Either";
import { User } from "@/src/features/users/domain/entities/User";
import {
  ChangePasswordUserMePayload,
  ChangeUserPasswordPayload,
} from "@/src/features/users/data/models/payloads";
import { CustomPagination } from "@/src/core/api/BaseState";
import {
  RegisterUserPayload,
  UpdateUserPayload,
} from "@/src/features/authentication/data/payload/AuthenticationPayloads";
import { UsersDataModuleSymbols } from "@/src/features/users/data/UsersDataModuleSymbols";
import { Query } from "@/src/core/api/services/url.service";
import { injector } from "@/src/ioc/utils/injector";

export interface UserRepository {
  getUsers: (request: Query) => Promise<Either<string, CustomPagination<User>>>;

  getUser: (id: string) => Promise<Either<string, User>>;

  getUserByUrl: (url: string, request: Query) => Promise<Either<string, User>>;

  registerUser: (
    request: RegisterUserPayload,
    headers?: Record<string, string>
  ) => Promise<Either<string, any>>;

  getUserMe: () => Promise<Either<string, User>>;

  updateUserMe: (request: any) => Promise<Either<string, any>>;

  changePasswordUserMe: (
    data: ChangePasswordUserMePayload
  ) => Promise<Either<string, User>>;

  changeUserPassword: (
    id: string,
    data: ChangeUserPasswordPayload
  ) => Promise<Either<string, User>>;

  updateUser: (
    id: string,
    request: UpdateUserPayload
  ) => Promise<Either<string, User>>;

  validateUserField: (
    field: string,
    value: string,
    id?: string
  ) => Promise<boolean>;
}

export const usersRepository = injector<UserRepository>(
  UsersDataModuleSymbols.USERS_REPOSITORY
);
