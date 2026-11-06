import type { ChatMessage } from "./ChatMessage";
import type { GroundedChatResponse, GroundedSource } from "./FaqChunk";

export type SavedChatMessage = ChatMessage & {
  id: string;
  createdAt: string;
  sources: GroundedSource[];
  action?: GroundedChatResponse["action"];
};

export type ChatConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatConversation = ChatConversationSummary & {
  messages: SavedChatMessage[];
};

export type SaveChatTurnCommand = {
  conversationId?: string;
  title: string;
  userMessage: string;
  assistantMessage: string;
  sources?: GroundedSource[];
  action?: GroundedChatResponse["action"];
};
