import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type { Booking } from "../models/Booking";
import type { BookingRepository } from "../repositories/BookingRepository";

export const getMyBookingUseCase = (
  repository: BookingRepository,
): IUseCase<string, Promise<Either<string, Booking | null>>> => ({
  execute: (id) => repository.getMyBooking(id),
});
