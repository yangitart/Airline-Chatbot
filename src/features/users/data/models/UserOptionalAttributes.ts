import { PlanEntity } from "@/src/features/entities/domain/entities/Entity";
import {
  AcademicDegreeNomenclature,
  ScientificDegreeNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";
import { SystemRoleNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";

export interface UserOptionalAttributes {
  email: string;
  fullName?: string;
  password?: string;
  avatarUrl?: string;
  profile: UserProfile;
  isActive?: boolean;
  isAdmin?: boolean;
  isEnabled?: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: string;
  roles?: SystemRoleNomenclature[];
  username?: string;
}

export interface UserProfile {
  name: string;
  firstLastName: string;
  secondLastName: string;
  fullName: string;
  identityCard: string;
  phone: string;
  prefixName?: string;
  academicDegree?: AcademicDegreeNomenclature;
  scientificDegree?: ScientificDegreeNomenclature;
  entityId: string;
  entity: PlanEntity | string;
}
