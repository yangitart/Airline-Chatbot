import {
  AcademicDegreeNomenclature,
  EducationalCategoryNomenclature,
  ScientificCategoryNomenclature,
  ScientificDegreeNomenclature,
  TechnologistCategoryNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/PersonNomenclatures";

export type IdentityDocumentType = "PASSPORT" | "IDENTITY_CARD";
export type Sex = "MALE" | "FEMALE";

export interface UserPayload {
  id?: string;
  name: string;
  last_name: string;
  identity_document_type: IdentityDocumentType;
  identity_number: string;
  bank_account?: string;
  email?: string;
  phone?: string;
  scientific_category?: ScientificCategoryNomenclature;
  educational_category?: EducationalCategoryNomenclature;
  scientific_degree?: ScientificDegreeNomenclature;
  academic_degree?: AcademicDegreeNomenclature;
  technology_category?: TechnologistCategoryNomenclature;
  legal_information?: string;
  sex?: Sex;
  date_of_birth?: string;
  direction?: string;
  entity?: string;
  username: string;
  password: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  groups?: string[];
  user_permissions?: string[];
}
