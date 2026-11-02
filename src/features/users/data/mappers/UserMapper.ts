import { User } from "@/src/features/users/domain/entities/User";
import { UserModel } from "@/src/features/users/data/models/UserModel";
import { SystemRoleNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";
import { PlanEntity } from "@/src/features/entities/domain/entities/Entity";
import { UserLoginModel } from "@/src/features/users/data/models/UserLoginModel";

export const mapUserModelToUser = (user: UserModel): User => {
  return {
    id: user.id,
    url: user.url,
    username: user.username,
    email: user.email,
    identityCard: user.profile?.identityCard ?? "",
    prefixName: user.profile?.prefixName,
    name: user.profile?.name ?? "",
    firstLastName: user.profile?.firstLastName ?? "",
    secondLastName: user.profile?.secondLastName ?? "",
    fullName: user.fullName ?? user.profile?.fullName ?? "",
    phone: user.profile?.phone ?? "",
    avatarUrl: user.avatarUrl,
    scientificDegree: user.profile?.scientificDegree,
    academicDegree: user.profile?.academicDegree,
    entity: user.profile?.entity as PlanEntity,
    isActive: user.isActive ?? false,
    isAdmin: user.isAdmin ?? false,
    isEnabled: user.isEnabled ?? true,
    isSuperAdmin: user.isSuperAdmin ?? false,
    roles: user.roles ?? ([] as SystemRoleNomenclature[]),
    lastLogin: user.lastLogin,
    password: user.password,
  };
};

export const mapUsersModelToUsers = (users: UserModel[]): User[] =>
  users?.map((e) => mapUserModelToUser(e)) ?? [];

export const mapUserLoginModelToUser = (user: UserLoginModel): User => {
  return {
    id: user.id,
    entity: user.profile.entity as PlanEntity,
    username: user.username,
    email: user.email,
    identityCard: user.profile?.identityCard ?? "",
    url: user.userUrl,
    name: user.profile?.name ?? "",
    firstLastName: user.profile?.firstLastName ?? "",
    secondLastName: user.profile?.secondLastName ?? "",
    phone: user.profile?.phone ?? "",
    academicDegree: user.profile?.academicDegree,
    scientificDegree: user.profile?.scientificDegree,
  };
};
