import type { Either } from "fp-ts/Either";

export type DemoCheckoutEvent = {
  eventId: string;
  eventType: string;
  sessionId: string;
  paymentIntentId: string | null;
  paymentStatus: "paid" | "failed";
};

export interface DemoPaymentWebhookRepository {
  apply(event: DemoCheckoutEvent): Promise<Either<string, boolean>>;
}
