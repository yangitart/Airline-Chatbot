import type { ChatToolDefinition, ModelMessage } from "../../domain/models/ChatMessage";
import { ChatError } from "../../domain/models/ChatError";
import { requestAi } from "./providerHttp";
import { modelMessages, openAIToolDefinitions, readOpenAIResult, readOpenAIStream, toOpenAIMessages } from "./ChatModelProvider";

export class GroqChatModelProvider {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async complete(messages: ModelMessage[], signal: AbortSignal, groundingContext?: string, tools: ChatToolDefinition[] = [], responseLanguage = "en") {
    if (!this.apiKey.trim()) throw new ChatError("assistant_unavailable");
    const response = await requestAi("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(this.requestBody(messages, groundingContext, tools, false, responseLanguage)),
      cache: "no-store",
    });
    return readOpenAIResult(response);
  }

  async *stream(messages: ModelMessage[], signal: AbortSignal, groundingContext?: string, tools: ChatToolDefinition[] = [], responseLanguage = "en") {
    if (!this.apiKey.trim()) throw new ChatError("assistant_unavailable");
    const response = await requestAi("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(this.requestBody(messages, groundingContext, tools, true, responseLanguage)),
      cache: "no-store",
    });
    yield* readOpenAIStream(response, signal);
  }

  private requestBody(messages: ModelMessage[], groundingContext: string | undefined, tools: ChatToolDefinition[], stream: boolean, responseLanguage: string) {
    return {
      model: this.model,
      messages: toOpenAIMessages(modelMessages(messages, groundingContext, responseLanguage)),
      temperature: 0.2,
      max_completion_tokens: 512,
      stream,
      ...(tools.length ? { tools: openAIToolDefinitions(tools), tool_choice: "auto" } : {}),
    };
  }
}
