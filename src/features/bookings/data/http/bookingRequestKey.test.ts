// @vitest-environment node

import { describe, expect, it } from "vitest";
import { bookingUuidPattern, resolveBookingRequestKey } from "./bookingRequestKey";

const actionId = "9e9af8d1-050e-4100-bd17-dbe3e1d20f20";
const outboundId = "18651c57-3c98-43e4-9e64-cfe1d0130f06";
const returnId = "18651c57-3c98-43e4-9e64-cfe1d0130f07";

describe("booking request keys", () => {
  it("accepts existing booking UUIDs and preserves keys from the old chat client", () => {
    expect(resolveBookingRequestKey(actionId, outboundId)).toBe(actionId);
    expect(resolveBookingRequestKey(`chat:${actionId}`, outboundId)).toBe("bf275fdd-22e0-4243-bfec-5adc77ef1b70");
    expect(resolveBookingRequestKey("chat:not-an-id", outboundId)).toBeUndefined();
  });

  it("keeps retries stable and separates different flights in the same chat action", () => {
    const requestKey = `chat:${actionId}`;
    const roundTrip = resolveBookingRequestKey(requestKey, outboundId, returnId);
    expect(roundTrip).toMatch(bookingUuidPattern);
    expect(resolveBookingRequestKey(requestKey, outboundId.toUpperCase(), returnId)).toBe(roundTrip);
    expect(resolveBookingRequestKey(requestKey, outboundId)).not.toBe(roundTrip);
    expect(resolveBookingRequestKey(requestKey, returnId)).not.toBe(resolveBookingRequestKey(requestKey, outboundId));
  });
});
