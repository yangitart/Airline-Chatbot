import { create } from "zustand";
import { BaseItemNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/BaseItemNomenclature";
import { nomenclatureRepository } from "@/src/features/shared/nomenclatures/domain/repositories/NomenclaturesRepository";
import { Query } from "@/src/core/api/services/url.service";
import {
  MunicipalityNomenclature,
  ProvinceNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature";
import { TopicsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/TopicsNomenclature";
import { OutputsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/OutputsNomenclature";
import { EconomicActivityNomenclatureModel, OrganizationalFormNomenclatureModel } from "@/src/features/shared/nomenclatures/data/models/NomenclatureModel";
import { formatFilters } from "@/src/core/api/services/graphQl.service";

type NomenclaturesStore = {
  scientificDegrees: BaseItemNomenclature[];
  academicDegrees: BaseItemNomenclature[];
  provinces: ProvinceNomenclature[];
  countries: BaseItemNomenclature[];
  administrationBodies: BaseItemNomenclature[];
  topics: TopicsNomenclature[];
  outputs: OutputsNomenclature[];
  organizationalForm: OrganizationalFormNomenclatureModel[];
  economicActivity: EconomicActivityNomenclatureModel[];
  currency: BaseItemNomenclature[];
  expenseElements: BaseItemNomenclature[];
  financingSources: BaseItemNomenclature[];

  getProvinces: (request: Query) => void;
  getCountries: (request: Query) => void;
  getScientificDegrees: () => void;
  getAcademicDegrees: () => void;
  getMunicipalities: (
    url: string
  ) => Promise<MunicipalityNomenclature[] | null | undefined>;
  getTopics: (request: Query) => void;
  getOutputs: (request: Query) => void;
  getOrganizationalForm: (request: Query) => void;
  getEconomicActivity: (request: Query) => void;
  getCurrencies: (request: Query) => void;
  getExpenseElements: (request: Query) => void;
  getFinancingSources: (request: Query) => void;
};

export const useNomenclatureStore = create<NomenclaturesStore>()(
  (setState) => ({
    scientificCategory: [],
    educationalCategories: [],
    scientificDegrees: [],
    academicDegrees: [],
    englishLevels: [],
    technologyCategories: [],
    lineOfResearch: [],
    provinces: [],
    administrationBodies: [],
    countries: [],
    topics: [],
    outputs: [],
    organizationalForm: [],
    economicActivity: [],
    currency: [],
    expenseElements: [],
    financingSources: [],

    getScientificDegrees: async () => {
      const response = await nomenclatureRepository.getScientificDegrees();
      if (response) {
        setState(() => ({ scientificDegrees: response }));
      }
    },
    getAcademicDegrees: async () => {
      const response = await nomenclatureRepository.getAcademicDegrees();
      if (response) {
        setState(() => ({ academicDegrees: response }));
      }
    },

    getCurrencies: async (request) => {
      const response = await nomenclatureRepository.getCurrency(request);
      if (response) {
        setState(() => ({ currency: response }));
      }
    },

    getProvinces: async (request) => {
      const response = await nomenclatureRepository.getProvinces(request);

      if (response) {
        setState(() => ({ provinces: response }));
      }
    },

    getCountries: async (request) => {
      const response = await nomenclatureRepository.getCountries(request);

      if (response) {
        setState(() => ({ countries: response }));
      }
    },

    getMunicipalities: async (url: string) => {
      const response = await nomenclatureRepository.getMunicipalities(url);

      if (response) return response;
      else return null;
    },

    getTopics: async (request) => {
      const response = await nomenclatureRepository.getTopics(request);
      if (response) setState(() => ({ topics: response }));
    },

    getOutputs: async (request) => {
      const response = await nomenclatureRepository.getOutputs(request);
      if (response) setState(() => ({ outputs: response }));
    },

    getOrganizationalForm: async (request) => {
      const response = await nomenclatureRepository.getOrganizationalForm(request);
      if (response) setState(() => ({ organizationalForm: response }));
    },

    getEconomicActivity: async (request) => {
      const response = await nomenclatureRepository.getEconomicActivity(request);
      if (response) setState(() => ({ economicActivity: response }));
    },

    getExpenseElements: async ({ filters = formatFilters({ atomic: true }) }) => {
      const response = await nomenclatureRepository.getExpenseElements({ filters });
      if (response) setState(() => ({ expenseElements: response }));
    },

    getFinancingSources: async (request) => {
      const response = await nomenclatureRepository.getFinancingSources(request);
      if (response) setState(() => ({ financingSources: response }));
    },
  })
);
