import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type { Booking } from "../models/Booking";
import type { BookingRepository } from "../repositories/BookingRepository";

export const listMyBookingsUseCase = (
  repository: BookingRepository,
): IUseCase<void, Promise<Either<string, Booking[]>>> => ({
  execute: () => repository.listMyBookings(),
});
