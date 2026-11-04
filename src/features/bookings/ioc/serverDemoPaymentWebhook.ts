import "server-only";
import { createSupabaseAdminClient } from "@/src/core/api/supabase/admin";
import { createSupabaseDemoPaymentWebhookDataSource } from "../data/data_sources/SupabaseDemoPaymentWebhookDataSource";
import { DemoPaymentWebhookRepositoryImpl } from "../data/repositories/DemoPaymentWebhookRepositoryImpl";
import { applyDemoPaymentWebhookUseCase } from "../domain/useCases/applyDemoPaymentWebhookUseCase";

export function createServerDemoPaymentWebhook() {
  const repository = DemoPaymentWebhookRepositoryImpl(createSupabaseDemoPaymentWebhookDataSource(createSupabaseAdminClient()));
  return applyDemoPaymentWebhookUseCase(repository);
}
