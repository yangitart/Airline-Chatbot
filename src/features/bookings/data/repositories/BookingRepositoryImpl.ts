import { ErrorData, SuccessData } from "@/src/core/api/errors/HandleResponse";
import type { BookingRepository } from "../../domain/repositories/BookingRepository";
import type { BookingDataSource } from "../data_sources/BookingDataSource";
import { mapBookingModel } from "../mappers/BookingMapper";

export const BookingRepositoryImpl = (
  dataSource: BookingDataSource,
): BookingRepository => ({
  createDemoBooking: async (command) => {
    try {
      return SuccessData(
        mapBookingModel(await dataSource.createDemoBooking(command)),
      );
    } catch (error) {
      return ErrorData(error);
    }
  },
  listMyBookings: async () => {
    try {
      return SuccessData(
        (await dataSource.listMyBookings()).map(mapBookingModel),
      );
    } catch (error) {
      return ErrorData(error);
    }
  },
  getMyBooking: async (id) => {
    try {
      const model = await dataSource.getMyBooking(id);
      return SuccessData(model ? mapBookingModel(model) : null);
    } catch (error) {
      return ErrorData(error);
    }
  },
});
