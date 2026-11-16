// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { ChatApiDataSourceImpl } from "@/src/features/chatbot/data/data_sources/ChatApiDataSource";
import { ChatRepositoryImpl } from "@/src/features/chatbot/data/repositories/ChatRepositoryImpl";

afterEach(() => vi.restoreAllMocks());

const input = { conversationId: "saved", message: "Hola", language: "es" };
const signal = () => new AbortController().signal;
function clientWithResponse(response: Response) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
  const restClient = axios.create({
    baseURL: "https://veyra.test",
    adapter: "fetch",
    withCredentials: true,
    headers: { Accept: "application/json" },
    timeout: 15_000,
    env: { fetch },
  });
  return {
    client: ChatRepositoryImpl(ChatApiDataSourceImpl(restClient)),
    fetch,
    restClient,
  };
}
function streamResponse(frames: Array<{ event: string; data: unknown }>) {
  return new Response(
    frames
      .map(
        ({ event, data }) =>
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
      )
      .join(""),
    {
      headers: { "Content-Type": "text/event-stream" },
    },
  );
}

describe("chat API repository", () => {
  it("uses the injected client for listing, reopening and deleting history", async () => {
    const summary = {
      id: "saved/id",
      title: "Trip",
      updatedAt: "2026-11-15T12:00:00Z",
    };
    const conversation = { ...summary, messages: [] };
    const { client, fetch } = clientWithResponse(Response.json({}));
    fetch
      .mockResolvedValueOnce(Response.json({ conversations: [summary] }))
      .mockResolvedValueOnce(Response.json({ conversation }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(client.listConversations(signal())).resolves.toEqual([
      summary,
    ]);
    await expect(client.getConversation(summary.id, signal())).resolves.toEqual(
      conversation,
    );
    await expect(
      client.deleteConversation(summary.id, signal()),
    ).resolves.toBeUndefined();
    const requests = fetch.mock.calls.map(([request]) => request as Request);
    expect(requests.map((request) => [request.method, request.url])).toEqual([
      ["GET", "https://veyra.test/api/v1/chat/conversations"],
      ["GET", "https://veyra.test/api/v1/chat/conversations/saved%2Fid"],
      ["DELETE", "https://veyra.test/api/v1/chat/conversations/saved%2Fid"],
    ]);
    expect(requests.every((request) => request.credentials === "include")).toBe(
      true,
    );
  });

  it("delivers deltas immediately and closes the connection after completion", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(stream) {
        controller = stream;
      },
    });
    const response = new Response(body, {
      headers: { "Content-Type": "text/event-stream" },
    });
    const { client, fetch } = clientWithResponse(response);
    fetch.mockImplementationOnce(async (input) => {
      const request = input as Request;
      request.signal.addEventListener(
        "abort",
        () => controller.error(request.signal.reason),
        { once: true },
      );
      return response;
    });
    const onDelta = vi.fn();
    let completed = false;
    const pending = client
      .sendMessage(input, { signal: signal(), onDelta })
      .then((result) => {
        completed = true;
        return result;
      });
    const encoder = new TextEncoder();
    controller.enqueue(
      encoder.encode('event: delta\ndata: {"content":"Partial"}\n\n'),
    );
    await vi.waitFor(() => expect(onDelta).toHaveBeenCalledWith("Partial"));
    expect(completed).toBe(false);
    controller.enqueue(
      encoder.encode(
        'event: complete\ndata: {"conversation_id":"saved","message":{"role":"assistant","content":"Partial answer"}}\n\n',
      ),
    );
    await expect(pending).resolves.toMatchObject({ content: "Partial answer" });
    expect((fetch.mock.calls[0][0] as Request).signal.aborted).toBe(true);
  });

  it.each([
    [401, { error: "unexpected_error" }, "auth_required"],
    [503, { error: "provider_rate_limited" }, "provider_rate_limited"],
    [500, { error: "raw_dependency_details" }, "connection_interrupted"],
  ])(
    "maps HTTP %s returned before a message stream opens",
    async (status, body, code) => {
      const { client } = clientWithResponse(Response.json(body, { status }));
      await expect(
        client.sendMessage(input, { signal: signal(), onDelta: vi.fn() }),
      ).rejects.toMatchObject({ code });
    },
  );

  it("aborts a pending response that is not an event stream", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(stream) {
        controller = stream;
      },
    });
    const response = new Response(body, {
      headers: { "Content-Type": "text/html" },
    });
    const { client, fetch } = clientWithResponse(response);
    fetch.mockImplementationOnce(async (input) => {
      const request = input as Request;
      request.signal.addEventListener(
        "abort",
        () => controller.error(request.signal.reason),
        { once: true },
      );
      return response;
    });
    await expect(
      client.sendMessage(input, { signal: signal(), onDelta: vi.fn() }),
    ).rejects.toMatchObject({ code: "connection_interrupted" });
    expect((fetch.mock.calls[0][0] as Request).signal.aborted).toBe(true);
  });

  it("streams deltas, maps the completion and sends only the saved ID and new message", async () => {
    const { client, fetch, restClient } = clientWithResponse(
      streamResponse([
        { event: "delta", data: { content: "Hola" } },
        {
          event: "complete",
          data: {
            conversation_id: "saved",
            message: { role: "assistant", content: "Hola" },
            sources: [
              {
                documentId: "faq",
                title: "Bags",
                section: "Allowance",
                href: "https://outside.test",
              },
            ],
            action: { type: "unknown" },
          },
        },
      ]),
    );
    restClient.interceptors.request.use((config) => {
      config.headers.set("X-Injected-Client", "shared");
      return config;
    });
    const post = vi.spyOn(restClient, "post");
    const onDelta = vi.fn();
    await expect(
      client.sendMessage(input, { signal: signal(), onDelta }),
    ).resolves.toEqual({
      conversationId: "saved",
      content: "Hola",
      sources: [],
      action: undefined,
    });
    expect(onDelta).toHaveBeenCalledWith("Hola");
    const request = fetch.mock.calls[0][0] as Request;
    expect(JSON.parse(await request.clone().text())).toEqual({
      conversation_id: "saved",
      message: "Hola",
      language: "es",
    });
    expect(request.credentials).toBe("include");
    expect(request.cache).toBe("no-store");
    expect(request.headers.get("X-Injected-Client")).toBe("shared");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(post).toHaveBeenCalledWith(
      "/api/v1/chat/messages",
      expect.any(Object),
      expect.objectContaining({
        adapter: "fetch",
        responseType: "stream",
        timeout: 100_000,
      }),
    );
  });

  it.each([
    [401, { error: "unexpected_error" }, "auth_required"],
    [503, { error: "provider_rate_limited" }, "provider_rate_limited"],
    [500, { error: "raw_dependency_details" }, "connection_interrupted"],
  ])("maps HTTP %s to a stable error", async (status, body, code) => {
    const { client } = clientWithResponse(Response.json(body, { status }));
    await expect(client.listConversations(signal())).rejects.toMatchObject({
      code,
    });
  });

  it("preserves a stable SSE error", async () => {
    const { client } = clientWithResponse(
      streamResponse([{ event: "error", data: { error: "provider_timeout" } }]),
    );
    await expect(
      client.sendMessage(input, { signal: signal(), onDelta: vi.fn() }),
    ).rejects.toMatchObject({ code: "provider_timeout" });
  });

  it.each([
    [{ event: "delta", data: { content: 2 } }],
    [
      {
        event: "complete",
        data: {
          conversation_id: "saved",
          message: { role: "assistant", content: "" },
        },
      },
    ],
    [{ event: "delta", data: { content: "Unfinished" } }],
  ])("rejects malformed or unfinished streams", async (frame) => {
    const { client } = clientWithResponse(streamResponse([frame]));
    await expect(
      client.sendMessage(input, { signal: signal(), onDelta: vi.fn() }),
    ).rejects.toMatchObject({ code: "connection_interrupted" });
  });

  it("keeps cancellation distinct from connection errors", async () => {
    const controller = new AbortController();
    const reason = new DOMException("Cancelled", "AbortError");
    const { client, fetch } = clientWithResponse(Response.json({}));
    fetch.mockImplementationOnce(async () => {
      controller.abort(reason);
      throw reason;
    });
    await expect(client.listConversations(controller.signal)).rejects.toBe(
      reason,
    );
  });

  it("rejects a history response for a different conversation", async () => {
    const { client } = clientWithResponse(
      Response.json({ conversation: { id: "other", messages: [] } }),
    );
    await expect(
      client.getConversation("saved", signal()),
    ).rejects.toMatchObject({ code: "history_unavailable" });
  });
});
