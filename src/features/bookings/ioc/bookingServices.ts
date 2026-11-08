import type { Either } from "fp-ts/Either";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type {
  Booking,
  CreateDemoBookingCommand,
} from "../domain/models/Booking";
import { injector } from "@/src/ioc/utils/injector";
import { BookingSymbols } from "./BookingSymbols";

export const bookingServices = {
  createDemoBooking: injector<
    IUseCase<CreateDemoBookingCommand, Promise<Either<string, Booking>>>
  >(BookingSymbols.createDemoBookingUseCase),
  listMyBookings: injector<IUseCase<void, Promise<Either<string, Booking[]>>>>(
    BookingSymbols.listMyBookingsUseCase,
  ),
  getMyBooking: injector<
    IUseCase<string, Promise<Either<string, Booking | null>>>
  >(BookingSymbols.getMyBookingUseCase),
};
