import { afterEach, expect, it, vi } from "vitest";
import { requestAi } from "@/src/features/chatbot/data/providers/providerHttp";

afterEach(() => vi.unstubAllGlobals());

it.each([
  ["credit_balance_exhausted", "provider_quota_exceeded"],
  ["rate_limit_exceeded", "provider_rate_limited"],
])("classifies a 429 with provider code %s as %s", async (code, expected) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: { code } }, { status: 429 })),
  );
  await expect(
    requestAi("https://example.test/chat", {}),
  ).rejects.toMatchObject({ code: expected });
});
