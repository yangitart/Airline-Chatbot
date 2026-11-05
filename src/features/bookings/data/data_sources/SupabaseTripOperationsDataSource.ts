import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseTripOperationsDataSource(supabase: SupabaseClient) {
  return {
    getOwnedCheckoutBooking: async (bookingId: string, userId: string) => {
      const { data, error } = await supabase.from("bookings")
        .select("id,booking_reference,user_id,total_fare_minor,currency,status,payment_status,stripe_checkout_session_id,is_demo")
        .eq("id", bookingId).eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
    saveCheckoutSession: async (bookingId: string, sessionId: string) => {
      const { error } = await supabase.rpc("save_demo_checkout_session", { p_booking_id: bookingId, p_session_id: sessionId });
      if (error) throw error;
    },
    checkInDemoBooking: async (bookingId: string, flightLeg: "outbound" | "return") => {
      const { data, error } = await supabase.rpc("check_in_demo_booking", { p_booking_id: bookingId, p_flight_leg: flightLeg });
      if (error) throw error;
      return data;
    },
  };
}
