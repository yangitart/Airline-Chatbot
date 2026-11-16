import { left } from "fp-ts/Either";
import { SuccessData } from "@/src/core/api/errors/HandleResponse";
import type { BookingActionsRepository } from "../../domain/repositories/BookingActionsRepository";
import type { BookingActionsDataSource } from "../data_sources/BookingActionsDataSource";
import { mapCheckout, mapCheckIn } from "../mappers/BookingActionMapper";
import { mapBookingError } from "../mappers/BookingErrorMapper";

export function BookingActionsRepositoryImpl(
  dataSource: BookingActionsDataSource,
): BookingActionsRepository {
  return {
    async createCheckout(bookingId) {
      try {
        return SuccessData(
          mapCheckout(await dataSource.createCheckout(bookingId)),
        );
      } catch (error) {
        return left(mapBookingError(error));
      }
    },
    async checkIn(bookingId, flightLeg) {
      try {
        return SuccessData(
          mapCheckIn(await dataSource.checkIn(bookingId, flightLeg), flightLeg),
        );
      } catch (error) {
        return left(mapBookingError(error));
      }
    },
  };
}
