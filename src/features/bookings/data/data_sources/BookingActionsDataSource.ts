import type { AxiosInstance } from "axios";
import type { CheckoutModel, CheckInModel } from "../models/BookingActionModel";

export const BookingActionsApiDataSourceImpl = (client: AxiosInstance) => ({
  async createCheckout(bookingId: string) {
    const { data } = await client.post<CheckoutModel>(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/checkout`,
    );
    return data;
  },
  async checkIn(bookingId: string, flightLeg: "outbound" | "return") {
    const { data } = await client.post<CheckInModel>(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/check-in`,
      { flight_leg: flightLeg },
    );
    return data;
  },
});
export type BookingActionsDataSource = ReturnType<
  typeof BookingActionsApiDataSourceImpl
>;
