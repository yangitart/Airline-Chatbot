import type { ChatConversation, ChatConversationSummary, SaveChatTurnCommand } from "../models/ChatHistory";
import type { ChatMessage } from "../models/ChatMessage";

export interface ChatHistoryRepository {
  listConversations(userId: string): Promise<ChatConversationSummary[]>;
  getConversation(conversationId: string): Promise<ChatConversation | null>;
  getConversationContext(conversationId: string, limit: number, signal?: AbortSignal): Promise<ChatMessage[] | null>;
  deleteConversation(conversationId: string): Promise<void>;
  saveTurn(command: SaveChatTurnCommand): Promise<string>;
}
