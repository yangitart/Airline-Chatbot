import { isAxiosError, type AxiosInstance } from "axios";
import { readServerSentEvents } from "@/src/core/api/stream/readServerSentEvents";
import { ChatApiError, type ChatMessageRequest } from "../models/ChatApiModel";

export const ChatApiDataSourceImpl = (restClient: AxiosInstance) => {
  async function readJson(path: string, signal: AbortSignal): Promise<unknown> {
    const { data } = await restClient.get<unknown>(`/api/v1/chat/${path}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
      timeout: 25_000,
      headers: { "Cache-Control": "no-cache" },
    });
    return data;
  }

  async function openMessageStream(
    input: ChatMessageRequest,
    signal: AbortSignal,
  ) {
    try {
      return await restClient.post<ReadableStream<Uint8Array>>(
        "/api/v1/chat/messages",
        input,
        {
          adapter: "fetch",
          responseType: "stream",
          signal: AbortSignal.any([signal, AbortSignal.timeout(100_000)]),
          // The shared client's 15-second timeout is too short for a chat turn.
          timeout: 100_000,
          headers: { Accept: "text/event-stream" },
          fetchOptions: { cache: "no-store" },
        },
      );
    } catch (error) {
      if (isAxiosError<ReadableStream<Uint8Array>>(error) && error.response) {
        // Axios returns an error body as a stream too when responseType is stream.
        const payload: unknown = await new Response(error.response.data)
          .json()
          .catch(() => null);
        throw new ChatApiError(error.response.status, payload);
      }
      throw error;
    }
  }

  return {
    listConversations: (signal: AbortSignal) =>
      readJson("conversations", signal),
    getConversation: (id: string, signal: AbortSignal) =>
      readJson(`conversations/${encodeURIComponent(id)}`, signal),
    async deleteConversation(id: string, signal: AbortSignal) {
      await restClient.delete(
        `/api/v1/chat/conversations/${encodeURIComponent(id)}`,
        {
          signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
          timeout: 15_000,
        },
      );
    },
    async *streamMessage(input: ChatMessageRequest, signal: AbortSignal) {
      const cancellation = new AbortController();
      let body: ReadableStream<Uint8Array> | undefined;
      let frames: ReturnType<typeof readServerSentEvents> | undefined;
      try {
        const response = await openMessageStream(
          input,
          AbortSignal.any([signal, cancellation.signal]),
        );
        if (!response.data || typeof response.data.getReader !== "function") {
          throw new Error("invalid_chat_stream");
        }
        body = response.data;
        if (
          !String(response.headers["content-type"] ?? "").includes(
            "text/event-stream",
          )
        ) {
          throw new Error("invalid_chat_stream");
        }
        frames = readServerSentEvents(body);
        while (true) {
          const { value: frame, done } = await frames.next();
          if (done) return;
          if (!["delta", "error", "complete"].includes(frame.event)) continue;
          yield {
            event: frame.event,
            payload: JSON.parse(frame.data) as unknown,
          };
        }
      } finally {
        // Abort pending network reads before waiting for the SSE reader to close.
        cancellation.abort();
        if (frames) await frames.return(undefined);
        else if (body) await body.cancel().catch(() => undefined);
      }
    },
  };
};

export type ChatApiDataSource = ReturnType<typeof ChatApiDataSourceImpl>;
