import { isAxiosError } from "axios";
import { handleError } from "@/src/core/api/hooks/handleError";

const bookingErrorCodes = new Set([
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
  "inventory_changed",
  "fare_changed",
  "flight_unavailable",
]);

export function mapBookingError(error: unknown): string {
  if (isAxiosError<{ error_code?: unknown }>(error)) {
    if (error.response?.status === 401) return "auth_required";
    const code = error.response?.data?.error_code;
    if (typeof code === "string" && bookingErrorCodes.has(code)) return code;
    if (error.response?.status === 404) return "booking_not_found";
  }
  return handleError(error);
}
