import type { ChatRepository } from "../repositories/ChatRepository";

export const listConversationsUseCase = (repository: ChatRepository) => ({
  execute: (signal: AbortSignal) => repository.listConversations(signal),
});

export const getConversationUseCase = (repository: ChatRepository) => ({
  execute: (id: string, signal: AbortSignal) =>
    repository.getConversation(id, signal),
});

export const deleteConversationUseCase = (repository: ChatRepository) => ({
  execute: (id: string, signal: AbortSignal) =>
    repository.deleteConversation(id, signal),
});

export const sendMessageUseCase = (repository: ChatRepository) => ({
  execute: (...args: Parameters<ChatRepository["sendMessage"]>) =>
    repository.sendMessage(...args),
});
