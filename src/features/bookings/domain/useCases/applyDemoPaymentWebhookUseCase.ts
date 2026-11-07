import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { Either } from "fp-ts/Either";
import type {
  DemoCheckoutEvent,
  DemoPaymentWebhookRepository,
} from "../repositories/DemoPaymentWebhookRepository";

export const applyDemoPaymentWebhookUseCase = (
  repository: DemoPaymentWebhookRepository,
): IUseCase<DemoCheckoutEvent, Promise<Either<string, boolean>>> => ({
  execute: (event) => repository.apply(event),
});
