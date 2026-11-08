import type { Either } from "fp-ts/Either";

export type DemoCheckoutEvent = {
  eventId: string;
  eventType:
    | "checkout.session.completed"
    | "checkout.session.async_payment_succeeded"
    | "checkout.session.async_payment_failed"
    | "checkout.session.expired";
  sessionId: string;
  bookingId: string;
  amountTotal: number;
  currency: string;
  paymentIntentId: string | null;
};

export interface DemoPaymentWebhookRepository {
  apply(event: DemoCheckoutEvent): Promise<Either<string, boolean>>;
}
