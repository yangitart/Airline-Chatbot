// @vitest-environment node

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { SupabaseChatHistoryDataSource } from "@/src/features/chatbot/data/data_sources/SupabaseChatHistoryDataSource";

vi.mock("server-only", () => ({}));

function createDataSource(rows: unknown[]) {
  const fetch = vi.fn(
    async (_input: string | URL | Request, _init?: RequestInit) =>
      Response.json(rows),
  );
  const supabase = createClient("https://example.test", "public-key-for-test", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });
  return { source: new SupabaseChatHistoryDataSource(supabase), fetch };
}

describe("chat context query", () => {
  it("requests the bounded text-only context and returns it in conversation order", async () => {
    const { source, fetch } = createDataSource([
      {
        id: "conversation",
        chat_messages: [
          { role: "assistant", content: "Which dates work for you?" },
          { role: "user", content: "Find me a flight to Delhi." },
        ],
      },
    ]);

    await expect(
      source.getConversationContext("conversation", 10),
    ).resolves.toEqual([
      { role: "user", content: "Find me a flight to Delhi." },
      { role: "assistant", content: "Which dates work for you?" },
    ]);
    expect(fetch).toHaveBeenCalledOnce();
    const url = new URL(String(fetch.mock.calls[0][0]));
    expect(url.pathname).toBe("/rest/v1/chat_conversations");
    expect(url.searchParams.get("select")).toContain(
      "chat_messages(role,content)",
    );
    expect(url.searchParams.get("chat_messages.limit")).toBe("10");
    expect(url.searchParams.get("chat_messages.order")).toBe(
      "created_at.desc,role.asc,id.asc",
    );
    expect(url.searchParams.get("id")).toBe("eq.conversation");
  });

  it("distinguishes an inaccessible conversation from an existing empty one", async () => {
    await expect(
      createDataSource([]).source.getConversationContext("missing", 10),
    ).resolves.toBeNull();
    await expect(
      createDataSource([{ chat_messages: [] }]).source.getConversationContext(
        "empty",
        10,
      ),
    ).resolves.toEqual([]);
  });
});
