/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorData, SuccessData } from "@/src/core/api/errors/HandleResponse";
import { UsersDataSources } from "@/src/features/users/data/data_sources/UsersDataSources";
import { UserRepository } from "@/src/features/users/domain/repositories/UsersRepository";
import { mapUserModelToUser } from "@/src/features/users/data/mappers/UserMapper";

export const UserRepositoryImpl = (
  userDataSources: UsersDataSources
): UserRepository => ({
  async getUserMe() {
    try {
      const userFields = `
      * 
      profile{* entity{id url entity{ id url name code } entity_science_plan  is_governing_body current_entity_science_plan { url }}}
      `;

      const response = await userDataSources.getUserMe({
        fields: userFields,
      });
      return SuccessData(mapUserModelToUser(response.data));
    } catch (error) {
      return ErrorData(error);
    }
  },

  updateUserMe: async function (request) {
    try {
      const response = await userDataSources.updateUserMe(request);
      return SuccessData(mapUserModelToUser(response.data));
    } catch (error) {
      return ErrorData(error);
    }
  },

  getUser: async function (id) {
    try {
      const response = await userDataSources.getUser(id);

      return SuccessData(mapUserModelToUser(response.data));
    } catch (error) {
      return ErrorData(error);
    }
  },

  async changePasswordUserMe(data) {
    try {
      const response = await userDataSources.changePasswordUserMe(data);

      return SuccessData(response.data);
    } catch (error) {
      return ErrorData(error);
    }
  },

  async updateUser(id, data) {
    try {
      const response = await userDataSources.updateUser(id, data);

      return SuccessData(response.data);
    } catch (error) {
      return ErrorData(error);
    }
  },

  registerUser: async (data, headers) => {
    try {
      const response = await userDataSources.registerUser(data, headers);

      return SuccessData(response.data);
    } catch (error) {
      return ErrorData(error);
    }
  },

  async getUsers(request) {
    try {
      const response = await userDataSources.getUsers(request);

      return SuccessData(response.data);
    } catch (error: any) {
      return ErrorData(error);
    }
  },
  async getUserByUrl(url, request) {
    try {
      const response = await userDataSources.getUserByUrl(url, request);

      return SuccessData(response.data);
    } catch (error: any) {
      return ErrorData(error);
    }
  },

  async changeUserPassword(id, request) {
    try {
      const response = await userDataSources.changeUserPassword(id, request);

      return SuccessData(response.data);
    } catch (error: any) {
      return ErrorData(error);
    }
  },

  validateUserField: async function (field, value, id) {
    try {
      const payload = {
        id,
        [field]: value,
      };
      const response = await userDataSources.validateUserField(payload);

      if (response) {
        return true;
      } else return false;
    } catch (error) {
      return false;
    }
  },
});
