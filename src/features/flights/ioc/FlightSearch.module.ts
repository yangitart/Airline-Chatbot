import { ContainerModule, interfaces } from "inversify";
import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";
import { FlightSearchQuery } from "../domain/models/FlightSearch";
import { FlightSearchRepository } from "../domain/repositories/FlightSearchRepository";
import { FeaturedFlightsResponse, getFeaturedFlightsUseCase, SearchFlightsResponse, searchFlightsUseCase } from "../domain/useCases/searchFlightsUseCase";
import { FlightSearchDataSource, FlightSearchApiDataSourceImpl } from "../data/data_sources/FlightSearchDataSource";
import { FlightSearchRepositoryImpl } from "../data/repositories/FlightSearchRepositoryImpl";
import { FlightSearchSymbols } from "./FlightSearchSymbols";

const initializeModule = (bind: interfaces.Bind) => {
  bind<FlightSearchDataSource>(FlightSearchSymbols.dataSource).toConstantValue(
    applyDependencies(FlightSearchApiDataSourceImpl, [NetWorkDataModuleSymbols.REST_CLIENT]),
  );

  bind<FlightSearchRepository>(FlightSearchSymbols.repository).toConstantValue(
    applyDependencies(FlightSearchRepositoryImpl, [FlightSearchSymbols.dataSource]),
  );

  bind<IUseCase<FlightSearchQuery, SearchFlightsResponse>>(FlightSearchSymbols.searchUseCase).toConstantValue(
    applyDependencies(searchFlightsUseCase, [FlightSearchSymbols.repository]),
  );

  bind<IUseCase<string, FeaturedFlightsResponse>>(FlightSearchSymbols.featuredFlightsUseCase).toConstantValue(
    applyDependencies(getFeaturedFlightsUseCase, [FlightSearchSymbols.repository]),
  );
};

export const FlightSearchModule = new ContainerModule(initializeModule);
