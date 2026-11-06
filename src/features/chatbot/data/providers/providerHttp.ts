import { ChatError } from "../../domain/models/ChatError";

const quotaCodes = new Set([
  "insufficient_quota",
  "credit_balance_exhausted",
  "billing_hard_limit_reached",
  "project_spend_limit_exceeded",
  "organization_spend_limit_exceeded",
  "organization_usage_limit_exceeded",
  "usage_limit_exceeded",
]);

export function providerTransportError(error: unknown, fallback: "assistant_unavailable" | "faq_unavailable") {
  if (error instanceof ChatError) return error;
  if (error instanceof Error && error.name === "TimeoutError") return new ChatError("provider_timeout", error);
  return new ChatError(fallback, error);
}

export async function requestAi(
  url: string,
  init: RequestInit,
  fallback: "assistant_unavailable" | "faq_unavailable" = "assistant_unavailable",
) {
  try {
    const response = await fetch(url, { ...init, cache: "no-store", redirect: "error" });
    if (response.ok) return response;
    if (response.status === 429) {
      const payload = await response.json().catch(() => null) as { error?: { code?: unknown; type?: unknown } } | null;
      const isQuotaError = [payload?.error?.code, payload?.error?.type]
        .some((value) => typeof value === "string" && quotaCodes.has(value));
      throw new ChatError(isQuotaError ? "provider_quota_exceeded" : "provider_rate_limited");
    }
    await response.body?.cancel().catch(() => undefined);
    if (response.status === 408 || response.status === 504) throw new ChatError("provider_timeout");
    throw new ChatError(fallback);
  } catch (error) {
    init.signal?.throwIfAborted();
    throw providerTransportError(error, fallback);
  }
}
