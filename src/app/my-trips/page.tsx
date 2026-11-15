import MyTripsView from "@/src/features/bookings/ui/views/MyTripsView";
import { parseBookingLookup } from "@/src/features/bookings/domain/models/BookingReference";

export default async function MyTripsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lookup =
    typeof params.booking_id === "string"
      ? parseBookingLookup(params.booking_id)
      : null;
  const bookingId = lookup?.column === "id" ? lookup.value : null;
  const payment =
    params.payment === "return" || params.payment === "cancelled"
      ? params.payment
      : null;
  const checkInMode = params["check-in"] === "1";
  return (
    <MyTripsView
      key={JSON.stringify([checkInMode, payment, bookingId])}
      checkInMode={checkInMode}
      payment={payment}
      bookingId={bookingId}
    />
  );
}
