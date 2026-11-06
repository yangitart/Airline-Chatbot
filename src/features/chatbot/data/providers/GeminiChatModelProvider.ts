import type { ChatToolDefinition, ModelMessage } from "../../domain/models/ChatMessage";
import { ChatError } from "../../domain/models/ChatError";
import { requestAi } from "./providerHttp";
import { modelMessages, readGeminiResult, readGeminiStream, toGeminiContents, toGeminiTools } from "./ChatModelProvider";

export class GeminiChatModelProvider {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async complete(messages: ModelMessage[], signal: AbortSignal, groundingContext?: string, tools: ChatToolDefinition[] = [], responseLanguage = "en") {
    if (!this.apiKey.trim()) throw new ChatError("assistant_unavailable");
    const normalizedMessages = modelMessages(messages, groundingContext, responseLanguage);
    const systemInstruction = normalizedMessages[0].content;
    const response = await requestAi(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify(this.requestBody(normalizedMessages, systemInstruction, tools)),
      cache: "no-store",
    });
    return readGeminiResult(response);
  }

  async *stream(messages: ModelMessage[], signal: AbortSignal, groundingContext?: string, tools: ChatToolDefinition[] = [], responseLanguage = "en") {
    if (!this.apiKey.trim()) throw new ChatError("assistant_unavailable");
    const normalizedMessages = modelMessages(messages, groundingContext, responseLanguage);
    const systemInstruction = normalizedMessages[0].content;
    const response = await requestAi(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify(this.requestBody(normalizedMessages, systemInstruction, tools)),
      cache: "no-store",
    });
    yield* readGeminiStream(response, signal);
  }

  private requestBody(messages: ModelMessage[], systemInstruction: string, tools: ChatToolDefinition[]) {
    return {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: toGeminiContents(messages),
      ...(tools.length ? { tools: toGeminiTools(tools) } : {}),
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    };
  }
}
