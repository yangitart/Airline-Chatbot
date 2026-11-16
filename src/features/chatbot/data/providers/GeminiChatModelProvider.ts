import type { ChatModelProvider } from "./ChatModelProvider";
import type {
  ChatToolDefinition,
  ModelMessage,
} from "../../domain/models/ChatMessage";
import { ChatError } from "../../domain/models/ChatError";
import { requestAi } from "./providerHttp";
import {
  modelMessages,
  readGeminiResult,
  readGeminiStream,
  toGeminiContents,
  toGeminiTools,
} from "./ChatModelProvider";

export function GeminiChatModelProvider(
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
    const normalizedMessages = modelMessages(
      messages,
      groundingContext,
      responseLanguage,
    );
    const systemInstruction = normalizedMessages[0].content;
    const response = await requestAi(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(
          requestBody(normalizedMessages, systemInstruction, tools),
        ),
        cache: "no-store",
      },
    );
    return readGeminiResult(response);
  }

  async function* stream(
    messages: ModelMessage[],
    signal: AbortSignal,
    groundingContext?: string,
    tools: ChatToolDefinition[] = [],
    responseLanguage = "en",
  ) {
    if (!apiKey.trim()) throw new ChatError("assistant_unavailable");
    const normalizedMessages = modelMessages(
      messages,
      groundingContext,
      responseLanguage,
    );
    const systemInstruction = normalizedMessages[0].content;
    const response = await requestAi(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(
          requestBody(normalizedMessages, systemInstruction, tools),
        ),
        cache: "no-store",
      },
    );
    yield* readGeminiStream(response, signal);
  }

  function requestBody(
    messages: ModelMessage[],
    systemInstruction: string,
    tools: ChatToolDefinition[],
  ) {
    return {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: toGeminiContents(messages),
      ...(tools.length ? { tools: toGeminiTools(tools) } : {}),
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    };
  }
  return { complete, stream };
}
