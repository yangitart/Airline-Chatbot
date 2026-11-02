/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  generateUrl,
  generateUrlAndQuery,
  Query,
} from "@/src/core/api/services/url.service";
import { AxiosInstance } from "axios";
import { CountriesNomenclature, MunicipalityNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature";
import {
  MunicipalityNomenclatureModel,
  OutputsNomenclatureModel,
  ProvinceNomenclatureModel,
  TopicsNomenclatureModel,
} from "@/src/features/shared/nomenclatures/data/models/NomenclatureModel";
export interface NomenclaturesDataSources {
  getUnits: () => Promise<any>;
  getExpenseElements: (request: Query) => Promise<any>;
  getFinancingSources: (request: Query) => Promise<any>;
  getCurrency: () => Promise<any>;
  getCountriesByName: (request: Query) => Promise<any>;
  getScientificDegrees: () => Promise<any>;
  getAcademicDegrees: () => Promise<any>;
  getCountries: (request: Query) => Promise<CountriesNomenclature[]>;
  getProvinces: (request: Query) => Promise<ProvinceNomenclatureModel[]>;
  getMunicipalities: (url: string) => Promise<MunicipalityNomenclatureModel[]>;
  getTopics: (request: Query) => Promise<TopicsNomenclatureModel[]>;
  getOutputs: (request: Query) => Promise<OutputsNomenclatureModel[]>;
  getOrganizationalForm: (request: Query) => Promise<any>;
  getEconomicActivity: (request: Query) => Promise<any>;
}

const VERSION = 1;
const PEOPLE_BASE_PATH = "persons";

export const NomenclaturesDataSourcesImpl = (
  restClient: AxiosInstance
): NomenclaturesDataSources => ({
  getScientificDegrees: async function (): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${PEOPLE_BASE_PATH}/scientific-degrees/`,
    });
    return (await restClient.get(path)).data;
  },

  getUnits: async function (): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${PEOPLE_BASE_PATH}/units/`,
    });
    return (await restClient.get(path)).data;
  },

  getCurrency: async function (): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `currencies/`,
    });
    return (await restClient.get(path)).data;
  },

  getExpenseElements: async function ({filters}): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `expense-elements/`,
      filters: filters,
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getCountriesByName: async ({limit, page, search}) => {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${PEOPLE_BASE_PATH}/academic-degrees/`,
      queryParams: {
        limit,
        page,
        search
      }
    });

    return (await restClient.get(path)).data;
  },

  getAcademicDegrees: async function (): Promise<any> {
    const { path } = generateUrlAndQuery({
      version: VERSION,
      basePath: `${PEOPLE_BASE_PATH}/academic-degrees/`,
    });
    return (await restClient.get(path)).data;
  },

  getCountries: async function ({ limit, search, fields }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `countries/`,
      queryParams: { limit, search },
      queryFields: fields,
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getProvinces: async function ({ limit, search, fields }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `provinces/`,
      queryParams: { limit, search },
      queryFields: fields,
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getMunicipalities: async function (
    url: string
  ): Promise<MunicipalityNomenclature[]> {
    const newUrl = generateUrl(url, VERSION);
    return (await restClient.get(newUrl)).data;
  },

  getTopics: async function ({ limit, search }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `topics/`,
      queryParams: { limit, search },
    });
    return (await restClient.get(path, { params: { query } })).data;
  },
  getOutputs: async function ({ limit, search }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `resource-type/`,
      queryParams: { limit, search },
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getOrganizationalForm: async function ({ limit, search }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `organizational-form/`,
      queryParams: { limit, search },
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getEconomicActivity: async function ({ limit, search }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `economic-activity/`,
      queryParams: { limit, search },
    });
    return (await restClient.get(path, { params: { query } })).data;
  },

  getFinancingSources: async function ({ limit, search }): Promise<any> {
    const { path, query } = generateUrlAndQuery({
      version: VERSION,
      basePath: `financing-sources/`,
      queryParams: { limit, search },
    });
    return (await restClient.get(path, { params: { query } })).data;
  },
});
