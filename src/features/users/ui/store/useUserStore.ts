import { create } from "zustand";
import {
  BaseAppState,
  LoadingState,
  SuccessState,
} from "@/src/core/state/BaseAppState";
import { SuccessToast } from "@/src/components/toast/SuccessToast";
import { ErrorToast } from "@/src/components/toast/ErrorToast";
import { usersRepository, UserRepository } from "@/src/features/users/domain/repositories/UsersRepository";
import {
  ChangePasswordUserMePayload,
  UpdateUserMePayload,
} from "@/src/features/users/data/models/payloads";
import { RegisterUserPayload } from "@/src/features/authentication/data/payload/AuthenticationPayloads";
import { User } from "@/src/features/users/domain/entities/User";

type Events = {
  setUser: (user: User) => void;
  getUserMe: () => void;
  changePasswordUserMe: (
    request: ChangePasswordUserMePayload
  ) => Promise<boolean>;
  updateUserMe: (request: UpdateUserMePayload) => Promise<User>;
  registerUser: (
    request: RegisterUserPayload,
    headers?: Record<string, string>
  ) => Promise<boolean>;
};

export const useUserStore = create<BaseAppState<User> & Events>((setState) => ({
  data: null,
  error: null,
  isLoading: false,
  isEmpty: false,

  setUser: (user) => {
    setState(SuccessState(user));
  },

  getUserMe: async () => {
    setState(LoadingState);
    const response = await usersRepository.getUserMe();
    if (response._tag === "Right") setState(() => SuccessState(response.right));
  },

  updateUserMe: async (request) => {
    const response = await usersRepository.updateUserMe(request);
    if (response._tag === "Right") {
      SuccessToast();
      return response.right;
    } else {
      ErrorToast(response.left);
      return null;
    }
  },

  changePasswordUserMe: async (request) => {
    const response = await usersRepository.changePasswordUserMe(request);
    if (response._tag === "Right") {
      SuccessToast();
      return true;
    } else {
      ErrorToast(response.left);
      return false;
    }
  },

  registerUser: async (request, headers) => {
    const response = await usersRepository.registerUser(request, headers);
    if (response._tag === "Right") {
      SuccessToast();
      return true;
    } else {
      ErrorToast("Error al registrar el usuario");
      return false;
    }
  },
}));
