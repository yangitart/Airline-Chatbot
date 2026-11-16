import type {
  createCheckoutUseCase,
  checkInBookingUseCase,
} from "../domain/useCases/clientBookingActionsUseCases";
import type { getMyBookingUseCase } from "../domain/useCases/getMyBookingUseCase";
import type { Either } from "fp-ts/Either";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type {
  Booking,
  CreateDemoBookingCommand,
} from "../domain/models/Booking";
import { injector } from "@/src/ioc/utils/injector";
import { BookingSymbols } from "./BookingSymbols";

export const bookingServices = {
  createCheckout: injector<ReturnType<typeof createCheckoutUseCase>>(
    BookingSymbols.createCheckoutUseCase,
  ),
  checkIn: injector<ReturnType<typeof checkInBookingUseCase>>(
    BookingSymbols.checkInUseCase,
  ),
  createDemoBooking: injector<
    IUseCase<CreateDemoBookingCommand, Promise<Either<string, Booking>>>
  >(BookingSymbols.createDemoBookingUseCase),
  listMyBookings: injector<IUseCase<void, Promise<Either<string, Booking[]>>>>(
    BookingSymbols.listMyBookingsUseCase,
  ),
  getMyBooking: injector<ReturnType<typeof getMyBookingUseCase>>(
    BookingSymbols.getMyBookingUseCase,
  ),
};
