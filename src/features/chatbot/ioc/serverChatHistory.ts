import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseChatHistoryDataSource } from "../data/data_sources/SupabaseChatHistoryDataSource";
import {
  deleteChatConversationUseCase,
  getChatConversationContextUseCase,
  getChatConversationUseCase,
  listChatConversationsUseCase,
  saveChatTurnUseCase,
} from "../domain/useCases/manageChatHistoryUseCases";

export function createServerChatHistory(supabase: SupabaseClient) {
  const repository = new SupabaseChatHistoryDataSource(supabase);
  return {
    listConversations: listChatConversationsUseCase(repository),
    getConversation: getChatConversationUseCase(repository),
    getContext: getChatConversationContextUseCase(repository),
    deleteConversation: deleteChatConversationUseCase(repository),
    saveTurn: saveChatTurnUseCase(repository),
  };
}
