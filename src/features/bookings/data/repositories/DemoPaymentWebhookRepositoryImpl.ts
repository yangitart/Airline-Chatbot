import { left, right } from "fp-ts/Either";
import type { DemoPaymentWebhookRepository } from "../../domain/repositories/DemoPaymentWebhookRepository";
import type { createSupabaseDemoPaymentWebhookDataSource } from "../data_sources/SupabaseDemoPaymentWebhookDataSource";

type DataSource = ReturnType<typeof createSupabaseDemoPaymentWebhookDataSource>;
export function DemoPaymentWebhookRepositoryImpl(
  dataSource: DataSource,
): DemoPaymentWebhookRepository {
  return {
    apply: async (event) => {
      try {
        return right(await dataSource.apply(event));
      } catch (error) {
        return left(
          error instanceof Error ? error.message : "payment_event_failed",
        );
      }
    },
  };
}
