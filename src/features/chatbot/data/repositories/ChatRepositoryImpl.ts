import type { ChatRepository } from "../../domain/repositories/ChatRepository";
import { ChatError } from "../../domain/models/ChatError";
import type { ChatApiDataSource } from "../data_sources/ChatApiDataSource";
import {
  mapChatApiError,
  mapChatCompletion,
  mapChatErrorPayload,
  mapConversationList,
  mapConversationPayload,
} from "../mappers/ChatApiMapper";

async function readChat<T>(
  signal: AbortSignal,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    signal.throwIfAborted();
    throw mapChatApiError(error);
  }
}

export function ChatRepositoryImpl(
  dataSource: ChatApiDataSource,
): ChatRepository {
  return {
    listConversations: (signal) =>
      readChat(signal, async () =>
        mapConversationList(await dataSource.listConversations(signal)),
      ),
    getConversation: (id, signal) =>
      readChat(signal, async () =>
        mapConversationPayload(
          await dataSource.getConversation(id, signal),
          id,
        ),
      ),
    deleteConversation: (id, signal) =>
      readChat(signal, () => dataSource.deleteConversation(id, signal)),
    sendMessage: (input, { signal, onDelta }) =>
      readChat(signal, async () => {
        for await (const frame of dataSource.streamMessage(
          {
            conversation_id: input.conversationId,
            message: input.message,
            language: input.language,
          },
          signal,
        )) {
          if (frame.event === "error") throw mapChatErrorPayload(frame.payload);
          if (frame.event === "delta") {
            const payload = frame.payload as { content?: unknown } | null;
            if (typeof payload?.content !== "string")
              throw new ChatError("connection_interrupted");
            onDelta(payload.content);
          }
          if (frame.event === "complete")
            return mapChatCompletion(frame.payload);
        }
        throw new ChatError("connection_interrupted");
      }),
  };
}
