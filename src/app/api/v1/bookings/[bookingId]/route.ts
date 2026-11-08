import { NextRequest } from "next/server";
import { createAuthenticatedSupabaseContext } from "@/src/core/api/supabase/authenticatedRequest";
import { jsonError, jsonResponse } from "@/src/core/api/http/jsonResponse";
import { createServerBookings } from "@/src/features/bookings/ioc/serverBookings";
import { isLeft } from "fp-ts/Either";
import { serializeBooking } from "@/src/features/bookings/data/mappers/BookingMapper";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await context.params;
  const { supabase, user } = await createAuthenticatedSupabaseContext();
  if (!user) return jsonError("Sign in to view this trip.", 401);

  const { getMyBooking } = createServerBookings(supabase);
  const result = await getMyBooking.execute(bookingId);
  if (isLeft(result))
    return jsonError("Trip details are temporarily unavailable.", 500);
  if (!result.right) return jsonError("Trip not found.", 404);
  return jsonResponse(serializeBooking(result.right));
}
