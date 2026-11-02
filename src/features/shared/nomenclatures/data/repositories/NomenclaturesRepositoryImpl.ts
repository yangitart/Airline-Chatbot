import { NomenclaturesRepository } from "@/src/features/shared/nomenclatures/domain/repositories/NomenclaturesRepository";
import { NomenclaturesDataSources } from "@/src/features/shared/nomenclatures/data/data_sources/NomenclaturesDataSources";
import {
  mapEconomicActivity,
  mapExpense,
  mapMunicipalityNomenclatureModelToMunicipalityNomenclature,
  mapOutputsNomenclatureModelToOutputsNomenclature,
  mapProvinceNomenclatureModelToProvinceNomenclature,
  mapTopicsNomenclatureModelToTopicsNomenclature,
} from "@/src/features/shared/nomenclatures/data/mappers/NomeclatureMapper";
import { ErrorData } from "@/src/core/api/errors/HandleResponse";
import { Query } from "@/src/core/api/services/url.service";
import { extractFinalIdFromUrl } from "@/src/core/utils/functions";

export const NomenclaturesRepositoryImpl = (
  nomenclaturesDataSources: NomenclaturesDataSources
): NomenclaturesRepository => {
  const filterUniqueByCode = <T>(
    items: T[],
    mapFn: (item: T) => any
  ): any[] => {
    const seen = new Set();
    const uniqueResponse = items.filter((item: any) => {
      if (seen.has(item.code)) return false;
      seen.add(item.code);
      return true;
    });
    return uniqueResponse.map(mapFn);
  };

  return {
    getScientificDegrees: async () => {
      try {
        return await nomenclaturesDataSources.getScientificDegrees();
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getCurrency: async () => {
      try {
        return await nomenclaturesDataSources.getCurrency();
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getExpenseElements: async (query) => {
      try {
        return await nomenclaturesDataSources.getExpenseElements(query);
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getAcademicDegrees: async () => {
      try {
        return await nomenclaturesDataSources.getAcademicDegrees();
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getProvinces: async ({
      limit,
      search,
      fields = "url name municipalities{ * }",
    }) => {
      try {
        const response = await nomenclaturesDataSources.getProvinces({
          limit,
          search,
          fields,
        });
        return response.map((province) =>
          mapProvinceNomenclatureModelToProvinceNomenclature(province)
        );
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getCountries: async ({
      limit,
      page,
      search,
      fields = `url name`,
    }: Query) => {
      try {
        let response = await nomenclaturesDataSources.getCountries({
          limit,
          page,
          search,
          fields,
        });
        response = response.map((item) => {
          item.id = extractFinalIdFromUrl(item.url)!.toString();
          return item;
        });
        return response;
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getMunicipalities: async (url: string) => {
      try {
        const response = await nomenclaturesDataSources.getMunicipalities(url);
        return response.map((municipality) =>
          mapMunicipalityNomenclatureModelToMunicipalityNomenclature(
            municipality
          )
        );
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getTopics: async ({ limit, search }) => {
      try {
        const response = await nomenclaturesDataSources.getTopics({
          limit,
          search,
        });
        return response.map((topic) =>
          mapTopicsNomenclatureModelToTopicsNomenclature(topic)
        );
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getOutputs: async ({ limit, search }) => {
      try {
        const response = await nomenclaturesDataSources.getOutputs({
          limit,
          search,
        });
        return response.map((output) =>
          mapOutputsNomenclatureModelToOutputsNomenclature(output)
        );
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getOrganizationalForm: async ({ limit, search }) => {
      try {
        const response = await nomenclaturesDataSources.getOrganizationalForm({
          limit,
          search,
        });
        return filterUniqueByCode(response, mapExpense);
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getFinancingSources: async ({ limit, search }) => {
      try {
        const response = await nomenclaturesDataSources.getFinancingSources({
          limit,
          search,
        });
        return response;
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },

    getEconomicActivity: async ({ limit, search }) => {
      try {
        const response = await nomenclaturesDataSources.getEconomicActivity({
          limit,
          search,
        });
        return filterUniqueByCode(response, mapEconomicActivity);
      } catch {
        throw ErrorData("Ha ocurrido un error de conexión");
      }
    },
  };
};
