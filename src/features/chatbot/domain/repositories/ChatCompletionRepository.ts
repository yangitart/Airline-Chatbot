import type {
  ChatCompletionStreamEvent,
  GroundedChatResponse,
} from "../models/FaqChunk";
import type { ChatMessage } from "../models/ChatMessage";

export interface ChatCompletionRepository {
  complete(
    messages: ChatMessage[],
    language: string,
  ): Promise<GroundedChatResponse>;
  stream(
    messages: ChatMessage[],
    language: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatCompletionStreamEvent>;
}
