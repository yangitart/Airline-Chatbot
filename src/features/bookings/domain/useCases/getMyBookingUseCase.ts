import type { BookingRepository } from "../repositories/BookingRepository";

export const getMyBookingUseCase = (repository: BookingRepository) => ({
  execute: (id: string, signal?: AbortSignal) =>
    repository.getMyBooking(id, signal),
});
