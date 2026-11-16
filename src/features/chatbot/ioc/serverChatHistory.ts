import "server-only";

import { ChatHistoryRepositoryImpl } from "../data/repositories/ChatHistoryRepositoryImpl";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseChatHistoryDataSourceImpl } from "../data/data_sources/SupabaseChatHistoryDataSource";
import {
  deleteChatConversationUseCase,
  getChatConversationContextUseCase,
  getChatConversationUseCase,
  listChatConversationsUseCase,
  saveChatTurnUseCase,
} from "../domain/useCases/manageChatHistoryUseCases";

export function createServerChatHistory(supabase: SupabaseClient) {
  const repository = ChatHistoryRepositoryImpl(
    SupabaseChatHistoryDataSourceImpl(supabase),
  );
  return {
    listConversations: listChatConversationsUseCase(repository),
    getConversation: getChatConversationUseCase(repository),
    getContext: getChatConversationContextUseCase(repository),
    deleteConversation: deleteChatConversationUseCase(repository),
    saveTurn: saveChatTurnUseCase(repository),
  };
}
