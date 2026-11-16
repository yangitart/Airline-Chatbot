import { isAxiosError } from "axios";
import { ChatError, isChatErrorCode } from "../../domain/models/ChatError";
import type {
  ChatConversation,
  ChatConversationSummary,
} from "../../domain/models/ChatHistory";
import type { GroundedChatResponse } from "../../domain/models/FaqChunk";
import { ChatApiError } from "../models/ChatApiModel";
import { readChatAction } from "./readChatAction";
import { mapChatSources } from "./ChatHistoryMapper";

export function mapChatApiError(error: unknown): ChatError {
  if (error instanceof ChatError) return error;
  if (isAxiosError(error) && error.response) {
    if (error.response.status === 401) return new ChatError("auth_required");
    return mapChatErrorPayload(error.response.data);
  }
  if (error instanceof ChatApiError) {
    if (error.status === 401) return new ChatError("auth_required");
    return mapChatErrorPayload(error.payload);
  }
  return new ChatError("connection_interrupted", error);
}

export function mapChatErrorPayload(payload: unknown) {
  const code =
    payload && typeof payload === "object" && "error" in payload
      ? payload.error
      : undefined;
  return new ChatError(isChatErrorCode(code) ? code : "connection_interrupted");
}

export function mapConversationList(
  payload: unknown,
): ChatConversationSummary[] {
  const rows = (payload as { conversations?: ChatConversationSummary[] } | null)
    ?.conversations;
  if (!Array.isArray(rows)) throw new ChatError("history_unavailable");
  return rows;
}

export function mapConversationPayload(
  payload: unknown,
  id: string,
): ChatConversation {
  const row = (payload as { conversation?: ChatConversation } | null)
    ?.conversation;
  if (row?.id !== id || !Array.isArray(row.messages))
    throw new ChatError("history_unavailable");
  return row;
}

export function mapChatCompletion(
  payload: unknown,
): GroundedChatResponse & { conversationId: string } {
  const value = payload as {
    conversation_id?: unknown;
    message?: { role?: unknown; content?: unknown };
    sources?: unknown;
    action?: unknown;
  } | null;
  if (
    typeof value?.conversation_id !== "string" ||
    value.message?.role !== "assistant" ||
    typeof value.message.content !== "string" ||
    !value.message.content.trim()
  ) {
    throw new ChatError("connection_interrupted");
  }
  return {
    conversationId: value.conversation_id,
    content: value.message.content,
    sources: mapChatSources(value.sources),
    action: readChatAction(value.action),
  };
}
