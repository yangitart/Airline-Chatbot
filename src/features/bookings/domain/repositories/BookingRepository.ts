import type { Either } from "fp-ts/Either";
import type { Booking, CreateDemoBookingCommand } from "../models/Booking";

export interface BookingRepository {
  createDemoBooking(command: CreateDemoBookingCommand): Promise<Either<string, Booking>>;
  listMyBookings(): Promise<Either<string, Booking[]>>;
  getMyBooking(id: string): Promise<Either<string, Booking | null>>;
}
