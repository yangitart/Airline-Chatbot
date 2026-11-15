import type { ChatMessage } from "../../domain/models/ChatMessage";
import type { GroundedChatResponse } from "../../domain/models/FaqChunk";

export type AssistantMessage = ChatMessage & { id: string } & Partial<
    Pick<GroundedChatResponse, "sources" | "action">
  >;
