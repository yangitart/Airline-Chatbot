/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosInstance } from "axios";
import {
  generateUrlAndQuery,
  Query,
} from "@/src/core/api/services/url.service";
import { UserModel } from "@/src/features/users/data/models/UserModel";
import {
  ChangePasswordUserMePayload,
  ChangeUserPasswordPayload,
  UpdateUserMePayload,
} from "@/src/features/users/data/models/payloads";
import { BlackListTokenPayload } from "@/src/features/users/data/models/payloads";
import {
  RegisterUserPayload,
  UpdateUserPayload,
} from "@/src/features/authentication/data/payload/AuthenticationPayloads";

export interface UsersDataSources {
  registerUser: (
    request: RegisterUserPayload,
    headers?: Record<string, string>
  ) => Promise<any>;
  changeUserPassword: (
    id: string,
    request: ChangeUserPasswordPayload
  ) => Promise<any>;
  setUserTokenInBlackList: (request: BlackListTokenPayload) => Promise<any>;

  validateUserField: (payload: any) => Promise<any>;

  getUserMe(request: Query): Promise<any>;

  updateUserMe(request: UpdateUserMePayload): Promise<any>;

  changePasswordUserMe(request: ChangePasswordUserMePayload): Promise<any>;

  updateUser(id: string, request: UpdateUserPayload): Promise<any>;

  getUsers(request: Query): Promise<any>;

  getUser(id: string): Promise<any>;

  getUserByUrl: (url: string, request: Query) => Promise<any>;
}

const VERSION = 1;
const BASE_PATH = "users";

export const UsersDataSourcesImpl = (
  restClient: AxiosInstance
): UsersDataSources => ({
  getUserMe: function ({ fields }): Promise<UserModel> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/me/`,
      queryFields: fields,
    });
    return restClient.get(path, { params: { query } });
  },

  updateUserMe: function (request): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/me_update/`,
    });

    return restClient.patch(path, request);
  },

  changePasswordUserMe: function (request): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/me/change-password/`,
    });

    return restClient.post(path, request);
  },

  changeUserPassword: function (id, request): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/${id}/change-password/`,
    });
    return restClient.post(path, request);
  },

  registerUser: function (
    request: RegisterUserPayload,
    headers?: Record<string, string>
  ): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/`,
    });
    return restClient.post(path, request, { headers });
  },

  getUser(id) {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/${id}/`,
    });
    return restClient.post(path);
  },

  getUsers({ limit, page, search, filters }) {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/`,
      queryParams: {
        limit,
        page,
        search,
      },
      filters,
    });
    return restClient.get(path, { params: { query } });
  },

  async getUserByUrl(url, { fields, limit, search }) {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: url,
      queryParams: { limit, search },
      queryFields: fields,
    });

    return (await restClient.get(path, { params: { query } })).data;
  },
  setUserTokenInBlackList: function (
    request: BlackListTokenPayload
  ): Promise<any> {
    throw new Error("Function not implemented.");
  },
  updateUser: function (id, request) {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/${id}/`,
    });
    return restClient.patch(path, request);
  },

  validateUserField: async function (payload) {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${BASE_PATH}/validate/`,
    });

    const { data } = await restClient.post(path, payload);

    return data;
  },
});
