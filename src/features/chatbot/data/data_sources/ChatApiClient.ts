import { readServerSentEvents } from "@/src/core/api/stream/readServerSentEvents";
import { ChatError, isChatErrorCode, type ChatErrorCode } from "../../domain/models/ChatError";
import type { ChatConversation, ChatConversationSummary } from "../../domain/models/ChatHistory";
import type { GroundedChatResponse } from "../../domain/models/FaqChunk";
import type { ChatClient } from "../../domain/repositories/ChatClient";
import { readChatAction } from "../mappers/readChatAction";

function readError(payload: unknown, fallback: ChatErrorCode) {
  const code = payload && typeof payload === "object" && "error" in payload ? payload.error : undefined;
  return new ChatError(isChatErrorCode(code) ? code : fallback);
}

async function request(path: string, init: RequestInit) {
  try {
    const response = await fetch(`/api/v1/chat/${path}`, { ...init, credentials: "same-origin", cache: "no-store" });
    if (response.ok) return response;
    if (response.status === 401) throw new ChatError("auth_required");
    const payload: unknown = await response.json().catch(() => null);
    throw readError(payload, "connection_interrupted");
  } catch (error) {
    if (error instanceof ChatError) throw error;
    throw new ChatError("connection_interrupted", error);
  }
}

async function readJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await request(path, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(25_000)]),
  });
  try {
    return await response.json() as T;
  } catch (error) {
    signal.throwIfAborted();
    throw new ChatError("connection_interrupted", error);
  }
}

type CompletionPayload = {
  conversation_id?: unknown;
  message?: { role?: unknown; content?: unknown };
  sources?: GroundedChatResponse["sources"];
  action?: unknown;
};

export const chatApiClient: ChatClient = {
  async listConversations(signal) {
    const payload = await readJson<{ conversations?: ChatConversationSummary[] }>("conversations", signal);
    if (!Array.isArray(payload?.conversations)) throw new ChatError("history_unavailable");
    return payload.conversations;
  },

  async getConversation(id, signal) {
    const payload = await readJson<{ conversation?: ChatConversation }>(`conversations/${encodeURIComponent(id)}`, signal);
    if (payload?.conversation?.id !== id || !Array.isArray(payload.conversation.messages)) {
      throw new ChatError("history_unavailable");
    }
    return payload.conversation;
  },

  async deleteConversation(id, signal) {
    await request(`conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    });
  },

  async sendMessage(input, { signal, onDelta }) {
    const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(100_000)]);
    const response = await request("messages", {
      method: "POST",
      signal: requestSignal,
      headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: input.conversationId, message: input.message, language: input.language }),
    });
    if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
      throw new ChatError("connection_interrupted");
    }

    try {
      for await (const frame of readServerSentEvents(response.body)) {
        if (frame.event === "error") throw readError(JSON.parse(frame.data), "connection_interrupted");
        if (frame.event === "delta") {
          const payload = JSON.parse(frame.data) as { content?: unknown };
          if (typeof payload?.content !== "string") throw new ChatError("connection_interrupted");
          onDelta(payload.content);
        }
        if (frame.event === "complete") {
          const payload = JSON.parse(frame.data) as CompletionPayload;
          if (typeof payload?.conversation_id !== "string" || payload.message?.role !== "assistant"
            || typeof payload.message.content !== "string" || !payload.message.content.trim()) {
            throw new ChatError("connection_interrupted");
          }
          return {
            conversationId: payload.conversation_id,
            content: payload.message.content,
            sources: payload.sources ?? [],
            action: readChatAction(payload.action),
          };
        }
      }
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof ChatError) throw error;
      throw new ChatError("connection_interrupted", error);
    }
    throw new ChatError("connection_interrupted");
  },
};
