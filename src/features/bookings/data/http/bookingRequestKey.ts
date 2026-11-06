import { createHash } from "node:crypto";

export const bookingUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveBookingRequestKey(value: unknown, outboundId: string, returnId?: string): string | undefined {
  if (typeof value !== "string") return;
  if (bookingUuidPattern.test(value)) return value;
  if (!value.startsWith("chat:")) return;

  const actionId = value.slice(5);
  if (!bookingUuidPattern.test(actionId)) return;
  // Match the UUID previously derived by Web Crypto for existing chat cards and retries.
  const seed = `${actionId.toLowerCase()}:${outboundId.toLowerCase()}:${returnId?.toLowerCase() ?? "one-way"}`;
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
