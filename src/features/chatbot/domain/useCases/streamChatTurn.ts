import { ChatError } from "../models/ChatError";
import type { ChatMessage } from "../models/ChatMessage";
import type { GroundedChatResponse } from "../models/FaqChunk";
import type { ChatAssistantUseCase } from "./sendChatMessageUseCase";
import type {
  getChatConversationContextUseCase,
  saveChatTurnUseCase,
} from "./manageChatHistoryUseCases";

type HistoryUseCases = {
  getContext: ReturnType<typeof getChatConversationContextUseCase>;
  saveTurn: ReturnType<typeof saveChatTurnUseCase>;
};

export async function prepareChatTurn(
  input: { conversationId?: string; message: string; language: string },
  history: HistoryUseCases,
  signal?: AbortSignal,
) {
  const messages: ChatMessage[] = [];
  if (input.conversationId) {
    const context = await history.getContext.execute(
      input.conversationId,
      10,
      signal,
    );
    if (!context) throw new ChatError("conversation_not_found");
    messages.push(...context);
  }
  messages.push({ role: "user", content: input.message });
  return { ...input, messages };
}

export async function* streamChatTurn(
  turn: Awaited<ReturnType<typeof prepareChatTurn>>,
  assistant: ChatAssistantUseCase,
  history: HistoryUseCases,
  signal: AbortSignal,
) {
  let response: GroundedChatResponse | undefined;
  const generationSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(65_000),
  ]);
  for await (const event of assistant.stream(turn, generationSignal)) {
    generationSignal.throwIfAborted();
    if (event.type === "delta") yield event;
    else response = event.response;
  }

  generationSignal.throwIfAborted();
  if (!response?.content) throw new ChatError("invalid_provider_response");
  const conversationId = await history.saveTurn.execute({
    conversationId: turn.conversationId,
    title: turn.message,
    userMessage: turn.message,
    assistantMessage: response.content,
    sources: response.sources,
    action: response.action,
  });
  yield { type: "complete" as const, conversationId, response };
}
