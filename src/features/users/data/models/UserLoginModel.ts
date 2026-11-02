import { SystemRoleNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";
import { UserProfile } from "./UserOptionalAttributes";

export interface UserLoginModel {
  id: string;
  userUrl: string;
  username: string;
  email: string;
  roles: SystemRoleNomenclature;
  profile: UserProfile;
}
