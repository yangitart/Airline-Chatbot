import { ScientificDegreeNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";

import { AcademicDegreeNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";

export interface UpdateUserMePayload {
  profile: {
    name: string;
    firstLastName: string;
    secondLastName: string;
    identityCard: string;
    phone: string;
    academicDegree?: AcademicDegreeNomenclature | null;
    scientificDegree?: ScientificDegreeNomenclature | null;
  };
  password?: string;
  username?: string;
  email: string;
}

export interface ChangePasswordUserMePayload {
  current: string;
  new: string;
  confirm: string;
}

export type ResetPasswordEmailPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  password: string;
  token: string;
};

export type BlackListTokenPayload = {
  token: string;
};

export type DecodeTokenPayload = {
  token: string;
};
export type ValidateTokenPayload = {
  token: string;
};

export type ChangeUserPasswordPayload = {
  password: string;
};
