import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseFlightStatusDataSource(supabase: SupabaseClient) {
  return {
    findByNumberAndDate: async (flightNumber: string, date: string) => {
      const { data, error } = await supabase
        .from("flight_status_snapshots")
        .select(
          "flight_date,flight_status,provider,is_demo,fetched_at,status_payload,flight_instances!inner(flight_number,origin_code,destination_code,departure_at,arrival_at)",
        )
        .eq("flight_date", date)
        .eq("flight_instances.flight_number", flightNumber)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}
