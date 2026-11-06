import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { ChatCompletionStreamEvent, GroundedChatResponse } from "../models/FaqChunk";
import type { ChatCompletionRequest, ChatMessage } from "../models/ChatMessage";
import type { ChatCompletionRepository } from "../repositories/ChatCompletionRepository";
import { ChatError } from "../models/ChatError";

export interface ChatAssistantUseCase extends IUseCase<ChatCompletionRequest, Promise<GroundedChatResponse>> {
  stream(request: ChatCompletionRequest, signal?: AbortSignal): AsyncGenerator<ChatCompletionStreamEvent>;
}

const MAX_MESSAGES = 12;
const MAX_USER_MESSAGE_LENGTH = 2000;
const MAX_ASSISTANT_CONTEXT_LENGTH = 8000;
const MAX_CONTEXT_CHARACTERS = 24000;

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) throw new ChatError("invalid_request");
  if (messages.length > MAX_MESSAGES) throw new ChatError("conversation_too_long");

  const normalized = messages.map((message) => {
    if (!message || typeof message !== "object") throw new ChatError("invalid_request");
    const { role, content } = message;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
      throw new ChatError("invalid_request");
    }
    const cleanContent = content.trim();
    const maximumLength = role === "user" ? MAX_USER_MESSAGE_LENGTH : MAX_ASSISTANT_CONTEXT_LENGTH;
    if (role === "user" && cleanContent.length > maximumLength) throw new ChatError("message_too_long");
    return { role, content: cleanContent.slice(0, maximumLength) };
  });

  if (normalized.at(-1)?.role !== "user") throw new ChatError("invalid_request");
  let contextCharacters = normalized.reduce((total, message) => total + message.content.length, 0);
  while (contextCharacters > MAX_CONTEXT_CHARACTERS && normalized.length > 2) {
    const removed = normalized.splice(0, 2);
    contextCharacters -= removed.reduce((total, message) => total + message.content.length, 0);
  }
  if (contextCharacters > MAX_CONTEXT_CHARACTERS) throw new ChatError("conversation_too_long");
  return normalized;
}

export function sendChatMessageUseCase(repository: ChatCompletionRepository): ChatAssistantUseCase {
  return {
    execute: async ({ messages, language }) => repository.complete(normalizeMessages(messages), language),
    stream: async function* ({ messages, language }, signal) {
      yield* repository.stream(normalizeMessages(messages), language, signal);
    },
  };
}
