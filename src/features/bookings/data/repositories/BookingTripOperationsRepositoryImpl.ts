import { left, right } from "fp-ts/Either";
import type {
  BookingTripOperationsRepository,
  CheckoutBooking,
  DemoCheckIn,
} from "../../domain/repositories/BookingTripOperationsRepository";
import type { createSupabaseTripOperationsDataSource } from "../data_sources/SupabaseTripOperationsDataSource";

type DataSource = ReturnType<typeof createSupabaseTripOperationsDataSource>;
function errorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "booking_operation_failed";
}

export function BookingTripOperationsRepositoryImpl(
  dataSource: DataSource,
): BookingTripOperationsRepository {
  return {
    getOwnedCheckoutBooking: async (bookingId: string, userId: string) => {
      try {
        return right(
          (await dataSource.getOwnedCheckoutBooking(
            bookingId,
            userId,
          )) as CheckoutBooking | null,
        );
      } catch (error) {
        return left(errorMessage(error));
      }
    },
    saveCheckoutSession: async (bookingId, userId, sessionId) => {
      try {
        await dataSource.saveCheckoutSession(bookingId, userId, sessionId);
        return right(undefined);
      } catch (error) {
        return left(errorMessage(error));
      }
    },
    checkInDemoBooking: async (
      bookingId: string,
      flightLeg: "outbound" | "return",
    ) => {
      try {
        return right(
          (await dataSource.checkInDemoBooking(
            bookingId,
            flightLeg,
          )) as DemoCheckIn,
        );
      } catch (error) {
        return left(errorMessage(error));
      }
    },
  };
}
