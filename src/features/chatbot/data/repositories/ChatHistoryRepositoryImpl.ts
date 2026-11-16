import { ChatError } from "../../domain/models/ChatError";
import type { ChatHistoryRepository } from "../../domain/repositories/ChatHistoryRepository";
import type { SupabaseChatHistoryDataSource } from "../data_sources/SupabaseChatHistoryDataSource";
import {
  mapChatConversation,
  mapChatConversationSummary,
} from "../mappers/ChatHistoryMapper";

async function readHistory<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ChatError) throw error;
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error &&
      error.code === "42501" &&
      error.message === "conversation_not_found"
    ) {
      throw new ChatError("conversation_not_found");
    }
    throw new ChatError("history_unavailable", error);
  }
}

export function ChatHistoryRepositoryImpl(
  dataSource: SupabaseChatHistoryDataSource,
): ChatHistoryRepository {
  return {
    listConversations: (userId) =>
      readHistory(async () =>
        (await dataSource.listConversations(userId)).map(
          mapChatConversationSummary,
        ),
      ),
    getConversation: (id) =>
      readHistory(async () => {
        const row = await dataSource.getConversation(id);
        return row ? mapChatConversation(row) : null;
      }),
    getConversationContext: (id, limit, signal) =>
      readHistory(async () => {
        const row = await dataSource.getConversationContext(id, limit, signal);
        return row ? [...row.chat_messages].reverse() : null;
      }),
    deleteConversation: (id) =>
      readHistory(() => dataSource.deleteConversation(id)),
    saveTurn: (command) =>
      readHistory(async () => {
        const id: unknown = await dataSource.saveTurn(command);
        if (typeof id !== "string") throw new ChatError("history_unavailable");
        return id;
      }),
  };
}
