// @vitest-environment node

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { ChatHistoryRepositoryImpl } from "@/src/features/chatbot/data/repositories/ChatHistoryRepositoryImpl";
import { SupabaseChatHistoryDataSourceImpl } from "@/src/features/chatbot/data/data_sources/SupabaseChatHistoryDataSource";

vi.mock("server-only", () => ({}));

function createDataSource(rows: unknown, status = 200) {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json(rows, { status }),
  );
  const supabase = createClient("https://example.test", "public-key-for-test", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });
  return {
    source: ChatHistoryRepositoryImpl(
      SupabaseChatHistoryDataSourceImpl(supabase),
    ),
    fetch,
  };
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

it("maps stored history, keeps chronological order and drops offsite citations", async () => {
  const summary = {
    id: "conversation",
    title: "Trip",
    updated_at: "2026-11-15T12:00:00Z",
  };
  const sources = [
    {
      documentId: "bags",
      title: "Bags",
      section: "Allowance",
      href: "/faqs/baggage",
    },
    {
      documentId: "other",
      title: "Other",
      section: "External",
      href: "https://outside.test",
    },
  ];
  const { source } = createDataSource([
    {
      ...summary,
      chat_messages: [
        {
          id: "answer",
          role: "assistant",
          content: "Answer",
          created_at: summary.updated_at,
          sources,
          action: null,
        },
        {
          id: "question",
          role: "user",
          content: "Question",
          created_at: summary.updated_at,
          sources: [],
          action: null,
        },
      ],
    },
  ]);
  const conversation = await source.getConversation("conversation");
  expect(conversation).toMatchObject({
    id: "conversation",
    updatedAt: summary.updated_at,
  });
  expect(conversation?.messages.map(({ id }) => id)).toEqual([
    "question",
    "answer",
  ]);
  expect(conversation?.messages[1].sources).toEqual([sources[0]]);
});

it.each([
  [
    { code: "42501", message: "conversation_not_found" },
    "conversation_not_found",
  ],
  [
    { code: "42P01", message: "private database detail" },
    "history_unavailable",
  ],
])("maps database failures to stable chat errors", async (body, code) => {
  const { source } = createDataSource(body, 403);
  await expect(source.getConversation("conversation")).rejects.toMatchObject({
    code,
    message: code,
  });
});

it("rejects a save RPC that does not return a conversation ID", async () => {
  const { source } = createDataSource(null);
  await expect(
    source.saveTurn({
      title: "Trip",
      userMessage: "Question",
      assistantMessage: "Answer",
    }),
  ).rejects.toMatchObject({ code: "history_unavailable" });
});
