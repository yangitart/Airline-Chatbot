import { ChatError } from "../../domain/models/ChatError";

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
    await response.body?.cancel().catch(() => undefined);
    if (response.status === 429) throw new ChatError("provider_rate_limited");
    if (response.status === 408 || response.status === 504) throw new ChatError("provider_timeout");
    throw new ChatError(fallback);
  } catch (error) {
    init.signal?.throwIfAborted();
    throw providerTransportError(error, fallback);
  }
}
