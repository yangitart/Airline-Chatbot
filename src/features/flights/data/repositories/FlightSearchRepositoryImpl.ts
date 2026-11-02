import { ErrorData, SuccessData } from "@/src/core/api/errors/HandleResponse";
import { FlightSearchRepository } from "../../domain/repositories/FlightSearchRepository";
import { FlightSearchDataSource } from "../data_sources/FlightSearchDataSource";
import { mapFlightSearchModel } from "../mappers/FlightSearchMapper";

export const FlightSearchRepositoryImpl = (
  dataSource: FlightSearchDataSource,
): FlightSearchRepository => ({
  search: async (query) => {
    try {
      return SuccessData(mapFlightSearchModel(await dataSource.search(query)));
    } catch (error) {
      return ErrorData(error);
    }
  },
});
