export interface ProvinceNomenclature {
  id: string;
  url: string;
  municipalities?: MunicipalityNomenclature[] | string;
  dpa?: string;
  name: string;
  codename?: string;
  dem_order?: number;
}

export interface MunicipalityNomenclature {
  id: string;
  url: string;
  name: string;
  dpa: string;
}

export interface CountriesNomenclature {
  id: string,
  url: string,
  name: string,
  alpha2_code: string,
  alpha3_code: string,
  countryCode: number,
  iso_3166_2_code: string,
  region: string,
  subregion: string,
  intermediate_region: string,
  region_code: number,
  subregionCode: number,
  intermediateRegionCode: number
}
