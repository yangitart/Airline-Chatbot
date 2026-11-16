import type { Booking } from "../../domain/models/Booking";
import type { CheckoutModel, CheckInModel } from "../models/BookingActionModel";

export function mapCheckout(model: CheckoutModel): string {
  if (typeof model?.checkout_url !== "string")
    throw new Error("invalid_checkout_url");
  const url = new URL(model.checkout_url);
  if (url.protocol !== "https:") throw new Error("invalid_checkout_url");
  return url.href;
}

export function mapCheckIn(
  model: CheckInModel,
  flightLeg: "outbound" | "return",
): Booking["checkIns"][number] {
  if (
    model?.checked_in !== true ||
    model.flight_leg !== flightLeg ||
    !model.checked_in_at ||
    !model.demo_seat ||
    !model.boarding_pass_reference
  ) {
    throw new Error("checkin_failed");
  }
  return {
    flightLeg,
    checkedInAt: model.checked_in_at,
    demoSeat: model.demo_seat,
    boardingPassReference: model.boarding_pass_reference,
  };
}
