import { PlanEntity } from "@/src/features/entities/domain/entities/Entity";
import {
  AcademicDegreeNomenclature,
  ScientificDegreeNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";
import { SystemRoleNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";

export interface User {
  id: string;
  url: string;
  email: string;
  identityCard: string;
  prefixName?: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  scientificDegree?: ScientificDegreeNomenclature;
  academicDegree?: AcademicDegreeNomenclature;
  entity: PlanEntity;
  username: string;
  isActive?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isEnabled?: boolean;
  roles?: SystemRoleNomenclature[];
  lastLogin?: string;
  password?: string;
}
