import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { isLeft } from "fp-ts/Either";
import { serializeBooking } from "@/src/features/bookings/data/mappers/BookingMapper";
import { createServerTripOperations } from "@/src/features/bookings/ioc/serverTripOperations";
import { bookingUuidPattern } from "@/src/features/bookings/data/http/bookingRequestKey";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in to view this trip.", 401);

  if (request.nextUrl.searchParams.get("fields") === "payment") {
    if (!bookingUuidPattern.test(bookingId))
      return jsonError("Trip not found.", 404);
    const result = await createServerTripOperations(
      supabase,
    ).getCheckoutBooking.execute({
      bookingId,
      userId: user.id,
    });
    if (isLeft(result))
      return jsonError("Payment status is temporarily unavailable.", 500);
    if (!result.right) return jsonError("Trip not found.", 404);
    return jsonResponse(
      {
        status: result.right.status,
        payment_status: result.right.payment_status,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { getMyBooking } = createServerBookings(supabase);
  const result = await getMyBooking.execute(bookingId);
  if (isLeft(result))
    return jsonError("Trip details are temporarily unavailable.", 500);
  if (!result.right) return jsonError("Trip not found.", 404);
  return jsonResponse(serializeBooking(result.right));
}
