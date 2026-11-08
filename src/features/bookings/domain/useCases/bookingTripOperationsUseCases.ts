import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type {
  BookingTripOperationsRepository,
  CheckoutBooking,
  DemoCheckIn,
} from "../repositories/BookingTripOperationsRepository";

export const getCheckoutBookingUseCase = (
  repository: BookingTripOperationsRepository,
): IUseCase<
  { bookingId: string; userId: string },
  Promise<Either<string, CheckoutBooking | null>>
> => ({
  execute: ({ bookingId, userId }) =>
    repository.getOwnedCheckoutBooking(bookingId, userId),
});

export const saveCheckoutSessionUseCase = (
  repository: BookingTripOperationsRepository,
): IUseCase<
  { bookingId: string; userId: string; sessionId: string },
  Promise<Either<string, void>>
> => ({
  execute: ({ bookingId, userId, sessionId }) =>
    repository.saveCheckoutSession(bookingId, userId, sessionId),
});

export const checkInDemoBookingUseCase = (
  repository: BookingTripOperationsRepository,
): IUseCase<
  { bookingId: string; flightLeg: "outbound" | "return" },
  Promise<Either<string, DemoCheckIn>>
> => ({
  execute: ({ bookingId, flightLeg }) =>
    repository.checkInDemoBooking(bookingId, flightLeg),
});
