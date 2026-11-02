import { MunicipalityNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature";

export interface ProvinceNomenclatureModel {
  url: string;
  municipalities?: string | MunicipalityNomenclature[];
  dpa?: string;
  name: string;
  codename?: string;
  dem_order?: number;
}

export interface MunicipalityNomenclatureModel {
  url: string;
  name: string;
  dpa: string;
}

export interface TopicsNomenclatureModel {
  url: string;
  name: string;
}

export interface OutputsNomenclatureModel {
  url: string;
  label: string;
  description: string;
  derivedFrom: string;
}

export interface OrganizationalFormNomenclatureModel {
  url: string;
  name: string;
  code: string;
}

export interface EconomicActivityNomenclatureModel {
  url: string;
  name: string;
  code: string;
}
