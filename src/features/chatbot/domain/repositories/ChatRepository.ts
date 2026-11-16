import type {
  ChatConversation,
  ChatConversationSummary,
} from "../models/ChatHistory";
import type { GroundedChatResponse } from "../models/FaqChunk";

export interface ChatRepository {
  listConversations(signal: AbortSignal): Promise<ChatConversationSummary[]>;
  getConversation(id: string, signal: AbortSignal): Promise<ChatConversation>;
  deleteConversation(id: string, signal: AbortSignal): Promise<void>;
  sendMessage(
    input: { conversationId?: string; message: string; language: string },
    options: { signal: AbortSignal; onDelta: (content: string) => void },
  ): Promise<GroundedChatResponse & { conversationId: string }>;
}
