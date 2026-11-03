import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type { Booking, CreateDemoBookingCommand } from "../models/Booking";
import type { BookingRepository } from "../repositories/BookingRepository";

export const createDemoBookingUseCase = (
  repository: BookingRepository,
): IUseCase<CreateDemoBookingCommand, Promise<Either<string, Booking>>> => ({
  execute: (command) => repository.createDemoBooking(command),
});
