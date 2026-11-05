import type { Either } from "fp-ts/Either";

export type CheckoutBooking = {
  id: string;
  booking_reference: string;
  user_id: string;
  total_fare_minor: number;
  currency: string;
  status: string;
  payment_status: "unpaid" | "checkout_pending" | "paid" | "failed";
  stripe_checkout_session_id: string | null;
  is_demo: boolean;
};

export type DemoCheckIn = { demo_seat: string; demo_boarding_pass_reference: string };

export interface BookingTripOperationsRepository {
  getOwnedCheckoutBooking(bookingId: string, userId: string): Promise<Either<string, CheckoutBooking | null>>;
  saveCheckoutSession(bookingId: string, sessionId: string): Promise<Either<string, void>>;
  checkInDemoBooking(bookingId: string, flightLeg: "outbound" | "return"): Promise<Either<string, DemoCheckIn>>;
}
