import { BaseItemNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/BaseItemNomenclature";
import {
  MunicipalityNomenclature,
  ProvinceNomenclature,
} from "@/src/features/shared/nomenclatures/domain/entities/LocationNomenclature";
import { OutputsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/OutputsNomenclature";
import { TopicsNomenclature } from "@/src/features/shared/nomenclatures/domain/entities/TopicsNomenclature";
import {
  ProvinceNomenclatureModel,
  MunicipalityNomenclatureModel,
  OutputsNomenclatureModel,
} from "@/src/features/shared/nomenclatures/data/models/NomenclatureModel";
import { TopicsNomenclatureModel } from "@/src/features/shared/nomenclatures/data/models/NomenclatureModel";

export const mapProvinceNomenclatureModelToProvinceNomenclature = (
  province: ProvinceNomenclatureModel
): ProvinceNomenclature => {
  return {
    id: province.url,
    url: province.url,
    municipalities: province.municipalities,
    dpa: province.dpa,
    name: province.name,
    codename: province.codename,
    dem_order: province.dem_order,
  };
};

export const mapMunicipalityNomenclatureModelToMunicipalityNomenclature = (
  municipality: MunicipalityNomenclatureModel
): MunicipalityNomenclature => {
  return {
    id: municipality.url,
    url: municipality.url,
    name: municipality.name,
    dpa: municipality.dpa,
  };
};

export const mapTopicsNomenclatureModelToTopicsNomenclature = (
  topic: TopicsNomenclatureModel
): TopicsNomenclature => {
  return {
    id: topic.url,
    url: topic.url,
    name: topic.name,
  };
};

export const mapOutputsNomenclatureModelToOutputsNomenclature = (
  output: OutputsNomenclatureModel
): OutputsNomenclature => {
  return {
    id: output.url,
    url: output.url,
    label: output.label,
    description: output.description,
    derivedFrom: output.derivedFrom,
  };
};

export const mapExpense = (
  output: any
): BaseItemNomenclature => {
  return {
    url: output.url,
    code: output.code,
    name: output.description,
  };
};

export const mapEconomicActivity = (
  output: any
): BaseItemNomenclature => {
  return {
    url: output.url,
    name: output.description,
    code: output.code
  };
};
