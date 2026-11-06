import type { ChatHistoryRepository } from "../repositories/ChatHistoryRepository";

export function listChatConversationsUseCase(repository: ChatHistoryRepository) {
  return { execute: (userId: string) => repository.listConversations(userId) };
}

export function getChatConversationUseCase(repository: ChatHistoryRepository) {
  return { execute: (conversationId: string) => repository.getConversation(conversationId) };
}

export function getChatConversationContextUseCase(repository: ChatHistoryRepository) {
  return {
    execute: (conversationId: string, limit: number, signal?: AbortSignal) =>
      repository.getConversationContext(conversationId, limit, signal),
  };
}

export function deleteChatConversationUseCase(repository: ChatHistoryRepository) {
  return { execute: (conversationId: string) => repository.deleteConversation(conversationId) };
}

export function saveChatTurnUseCase(repository: ChatHistoryRepository) {
  return { execute: (command: Parameters<ChatHistoryRepository["saveTurn"]>[0]) => repository.saveTurn(command) };
}
