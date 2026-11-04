import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DemoCheckoutEvent } from "../../domain/repositories/DemoPaymentWebhookRepository";

export function createSupabaseDemoPaymentWebhookDataSource(supabase: SupabaseClient) {
  return {
    apply: async (event: DemoCheckoutEvent) => {
      const { data, error } = await supabase.rpc("apply_demo_checkout_event", {
        p_event_id: event.eventId,
        p_event_type: event.eventType,
        p_session_id: event.sessionId,
        p_payment_intent_id: event.paymentIntentId,
        p_payment_status: event.paymentStatus,
      });
      if (error) throw error;
      return data === true;
    },
  };
}
