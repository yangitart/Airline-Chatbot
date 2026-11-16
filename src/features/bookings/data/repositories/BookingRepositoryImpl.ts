import { left } from "fp-ts/Either";
import { mapBookingError } from "../mappers/BookingErrorMapper";
import { SuccessData } from "@/src/core/api/errors/HandleResponse";
import type { BookingRepository } from "../../domain/repositories/BookingRepository";
import type { BookingDataSource } from "../data_sources/BookingDataSource";
import { mapBookingModel } from "../mappers/BookingMapper";

export const BookingRepositoryImpl = (
  dataSource: BookingDataSource,
): BookingRepository => ({
  createDemoBooking: async (command) => {
    try {
      const model = await dataSource.createDemoBooking(command);
      if (typeof model?.id !== "string" || !model.id)
        throw new Error("invalid_booking_response");
      return SuccessData(mapBookingModel(model));
    } catch (error) {
      return left(mapBookingError(error));
    }
  },
  listMyBookings: async () => {
    try {
      return SuccessData(
        (await dataSource.listMyBookings()).map(mapBookingModel),
      );
    } catch (error) {
      return left(mapBookingError(error));
    }
  },
  getMyBooking: async (id, signal) => {
    try {
      const model = await dataSource.getMyBooking(id, signal);
      if (model && model.id !== id) return left("booking_not_found");
      return SuccessData(model ? mapBookingModel(model) : null);
    } catch (error) {
      return left(mapBookingError(error));
    }
  },
});
