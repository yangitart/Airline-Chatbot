import { ContainerModule, interfaces } from "inversify";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type {
  Booking,
  CreateDemoBookingCommand,
} from "../domain/models/Booking";
import type { BookingRepository } from "../domain/repositories/BookingRepository";
import { createDemoBookingUseCase } from "../domain/useCases/createDemoBookingUseCase";
import { listMyBookingsUseCase } from "../domain/useCases/listMyBookingsUseCase";
import { getMyBookingUseCase } from "../domain/useCases/getMyBookingUseCase";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";
import {
  BookingApiDataSourceImpl,
  type BookingDataSource,
} from "../data/data_sources/BookingDataSource";
import { BookingRepositoryImpl } from "../data/repositories/BookingRepositoryImpl";
import { BookingSymbols } from "./BookingSymbols";

const initializeModule = (bind: interfaces.Bind) => {
  bind<BookingDataSource>(BookingSymbols.dataSource).toConstantValue(
    applyDependencies(BookingApiDataSourceImpl, [
      NetWorkDataModuleSymbols.REST_CLIENT,
    ]),
  );
  bind<BookingRepository>(BookingSymbols.repository).toConstantValue(
    applyDependencies(BookingRepositoryImpl, [BookingSymbols.dataSource]),
  );
  bind<IUseCase<CreateDemoBookingCommand, Promise<Either<string, Booking>>>>(
    BookingSymbols.createDemoBookingUseCase,
  ).toConstantValue(
    applyDependencies(createDemoBookingUseCase, [BookingSymbols.repository]),
  );
  bind<IUseCase<void, Promise<Either<string, Booking[]>>>>(
    BookingSymbols.listMyBookingsUseCase,
  ).toConstantValue(
    applyDependencies(listMyBookingsUseCase, [BookingSymbols.repository]),
  );
  bind<IUseCase<string, Promise<Either<string, Booking | null>>>>(
    BookingSymbols.getMyBookingUseCase,
  ).toConstantValue(
    applyDependencies(getMyBookingUseCase, [BookingSymbols.repository]),
  );
};

export const BookingModule = new ContainerModule(initializeModule);
