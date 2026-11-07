import type { AxiosInstance } from "axios";
import type { CreateDemoBookingCommand } from "../../domain/models/Booking";
import type { BookingModel } from "../models/BookingModel";

export interface BookingDataSource {
  createDemoBooking(command: CreateDemoBookingCommand): Promise<BookingModel>;
  listMyBookings(): Promise<BookingModel[]>;
  getMyBooking(id: string, signal?: AbortSignal): Promise<BookingModel | null>;
}

export const BookingApiDataSourceImpl = (
  client: AxiosInstance,
): BookingDataSource => ({
  createDemoBooking: async (command) => {
    const { data } = await client.post<BookingModel>(
      "/api/v1/bookings",
      {
        flight_instance_id: command.flightInstanceId,
        return_flight_instance_id: command.returnFlightInstanceId ?? null,
        cabin_class: command.cabinClass,
        passenger_count: command.passengerCount,
        expected_outbound_fare_minor: command.expectedOutboundFareMinor,
        expected_return_fare_minor: command.expectedReturnFareMinor ?? null,
        idempotency_key: command.idempotencyKey,
      },
      { headers: { "Idempotency-Key": command.idempotencyKey } },
    );
    return data;
  },
  listMyBookings: async () => {
    const { data } = await client.get<BookingModel[]>("/api/v1/bookings");
    return data;
  },
  getMyBooking: async (id, signal) => {
    const { data } = await client.get<BookingModel>(
      `/api/v1/bookings/${encodeURIComponent(id)}`,
      { signal },
    );
    return data;
  },
});
