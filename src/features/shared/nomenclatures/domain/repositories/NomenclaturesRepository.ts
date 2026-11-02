import { BaseItemNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/BaseItemNomenclature";
import { Query } from "@/src/core/api/services/url.service";
import { ServicesDataModuleSymbols } from "@/src/features/shared/Services.Module";
import {
  MunicipalityNomenclature,
  ProvinceNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature";
import { TopicsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/TopicsNomenclature";
import { OutputsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/OutputsNomenclature";
import { EconomicActivityNomenclatureModel, OrganizationalFormNomenclatureModel } from "@/src/features/shared/nomenclatures/data/models/NomenclatureModel";
import { injector } from "@/src/ioc/utils/injector";

export interface NomenclaturesRepository {
  getScientificDegrees: () => Promise<BaseItemNomenclature[]>;
  getAcademicDegrees: () => Promise<BaseItemNomenclature[]>;
  getExpenseElements: (request: Query) => Promise<BaseItemNomenclature[]>;
  getFinancingSources: (request: Query) => Promise<BaseItemNomenclature[]>;
  getProvinces: (request: Query) => Promise<ProvinceNomenclature[]>;
  getCurrency: (request: Query) => Promise<BaseItemNomenclature[]>;
  getMunicipalities: (url: string) => Promise<MunicipalityNomenclature[]>;
  getCountries: (request: Query) => Promise<BaseItemNomenclature[]>; 
  getTopics: (request: Query) => Promise<TopicsNomenclature[]>;
  getOutputs: (request: Query) => Promise<OutputsNomenclature[]>;
  getOrganizationalForm: (request: Query) => Promise<OrganizationalFormNomenclatureModel[]>;
  getEconomicActivity: (request: Query) => Promise<EconomicActivityNomenclatureModel[]>;
}

export const nomenclatureRepository = injector<NomenclaturesRepository>(
  ServicesDataModuleSymbols.NOMENCLATURES_REPOSITORY
);
