import { SystemRoleNomenclature } from '@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures';

export type UserRole = 'ADMIN' | 'CLIENT';

export type BaseRoleNomenclature = {
  id : number;
  group : 'SPP_PCT' | 'SPP_PROJECT';
  codeName : SystemRoleNomenclature;
  name : string;
};

export type RoleNomenclature = {
  role : BaseRoleNomenclature;
  entities : string[];
};
