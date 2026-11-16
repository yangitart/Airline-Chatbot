import type { BookingActionsRepository } from "../repositories/BookingActionsRepository";

export const createCheckoutUseCase = (
  repository: BookingActionsRepository,
) => ({
  execute: (bookingId: string) => repository.createCheckout(bookingId),
});

export const checkInBookingUseCase = (
  repository: BookingActionsRepository,
) => ({
  execute: (bookingId: string, flightLeg: "outbound" | "return") =>
    repository.checkIn(bookingId, flightLeg),
});
