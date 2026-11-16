import type { Either } from "fp-ts/Either";
import type { Booking } from "../models/Booking";

export interface BookingActionsRepository {
  createCheckout(bookingId: string): Promise<Either<string, string>>;
  checkIn(
    bookingId: string,
    flightLeg: "outbound" | "return",
  ): Promise<Either<string, Booking["checkIns"][number]>>;
}
