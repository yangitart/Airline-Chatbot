import { SystemRoleNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/SystemRoleNomenclatures";

export interface SessionModel {
  readonly access?: string;
  readonly refresh?: string;
  readonly userId?: string;
  readonly role?: SystemRoleNomenclature;
  readonly entityId?: string;
}
