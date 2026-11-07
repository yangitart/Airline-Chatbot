import { isAxiosError, type AxiosInstance } from "axios";
import { BookingApiDataSourceImpl } from "@/src/features/bookings/data/data_sources/BookingDataSource";
import { mapBookingModel } from "@/src/features/bookings/data/mappers/BookingMapper";
import { ChatError } from "../../domain/models/ChatError";
import {
  TripOperationError,
  type ChatBookingClient,
} from "../../domain/repositories/ChatClient";

const tripErrorCodes = new Set([
  "booking_not_found",
  "booking_load_failed",
  "booking_not_payable",
  "checkout_expired",
  "payment_verifying",
  "checkout_unavailable",
  "stripe_not_configured",
  "payment_required",
  "booking_not_eligible",
  "checkin_window_closed",
  "flight_leg_not_found",
  "flight_not_checkin_eligible",
  "checkin_failed",
]);

export function createChatBookingClient(
  restClient: AxiosInstance,
): ChatBookingClient {
  const bookings = BookingApiDataSourceImpl(restClient);

  function handleError(error: unknown): never {
    if (isAxiosError<{ error_code?: unknown }>(error)) {
      if (error.response?.status === 401) throw new ChatError("auth_required");
      const code = error.response?.data?.error_code;
      if (typeof code === "string" && tripErrorCodes.has(code))
        throw new TripOperationError(code);
      if (error.response?.status === 404)
        throw new TripOperationError("booking_not_found");
    }
    throw error;
  }

  return {
    async getBooking(bookingId, signal) {
      try {
        const booking = await bookings.getMyBooking(bookingId, signal);
        if (!booking || booking.id !== bookingId)
          throw new TripOperationError("booking_not_found");
        return mapBookingModel(booking);
      } catch (error) {
        return handleError(error);
      }
    },
    async createBooking(command) {
      try {
        const booking = await bookings.createDemoBooking(command);
        if (typeof booking?.id !== "string" || !booking.id)
          throw new Error("invalid_booking_response");
        return booking.id;
      } catch (error) {
        return handleError(error);
      }
    },
    async createCheckout(bookingId) {
      try {
        const { data } = await restClient.post<{ checkout_url?: unknown }>(
          `/api/v1/bookings/${encodeURIComponent(bookingId)}/checkout`,
        );
        if (typeof data?.checkout_url !== "string")
          throw new Error("invalid_checkout_url");
        const url = new URL(data.checkout_url);
        if (url.protocol !== "https:") throw new Error("invalid_checkout_url");
        return url.href;
      } catch (error) {
        return handleError(error);
      }
    },
    async checkIn(bookingId, flightLeg) {
      try {
        const { data } = await restClient.post<{
          checked_in?: boolean;
          flight_leg?: unknown;
          checked_in_at?: string;
          demo_seat?: string;
          boarding_pass_reference?: string;
        }>(`/api/v1/bookings/${encodeURIComponent(bookingId)}/check-in`, {
          flight_leg: flightLeg,
        });
        if (
          data?.checked_in !== true ||
          data.flight_leg !== flightLeg ||
          !data.checked_in_at ||
          !data.demo_seat ||
          !data.boarding_pass_reference
        ) {
          throw new TripOperationError("checkin_failed");
        }
        return {
          flightLeg,
          checkedInAt: data.checked_in_at,
          demoSeat: data.demo_seat,
          boardingPassReference: data.boarding_pass_reference,
        };
      } catch (error) {
        return handleError(error);
      }
    },
  };
}
