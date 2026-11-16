import type { ChatModelProvider } from "./ChatModelProvider";
import type {
  ChatToolDefinition,
  ModelMessage,
} from "../../domain/models/ChatMessage";
import { ChatError } from "../../domain/models/ChatError";
import { requestAi } from "./providerHttp";
import {
  modelMessages,
  openAIToolDefinitions,
  readOpenAIResult,
  readOpenAIStream,
  toOpenAIMessages,
} from "./ChatModelProvider";

export function GroqChatModelProvider(
  apiKey: string,
  model: string,
): ChatModelProvider {
  async function complete(
    messages: ModelMessage[],
    signal: AbortSignal,
    groundingContext?: string,
    tools: ChatToolDefinition[] = [],
    responseLanguage = "en",
  ) {
    if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
    const response = await requestAi(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          requestBody(
            messages,
            groundingContext,
            tools,
            false,
            responseLanguage,
          ),
        ),
        cache: "no-store",
      },
    );
    return readOpenAIResult(response);
  }

  async function* stream(
    messages: ModelMessage[],
    signal: AbortSignal,
    groundingContext?: string,
    tools: ChatToolDefinition[] = [],
    responseLanguage = "en",
  ) {
    if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
    const response = await requestAi(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          requestBody(
            messages,
            groundingContext,
            tools,
            true,
            responseLanguage,
          ),
        ),
        cache: "no-store",
      },
    );
    yield* readOpenAIStream(response, signal);
  }

  function requestBody(
    messages: ModelMessage[],
    groundingContext: string | undefined,
    tools: ChatToolDefinition[],
    stream: boolean,
    responseLanguage: string,
  ) {
    return {
      model: model,
      messages: toOpenAIMessages(
        modelMessages(messages, groundingContext, responseLanguage),
      ),
      temperature: 0.2,
      max_completion_tokens: 512,
      stream,
      ...(tools.length
        ? { tools: openAIToolDefinitions(tools), tool_choice: "auto" }
        : {}),
    };
  }
  return { complete, stream };
}
