import "server-only";

import { ChatError } from "../../domain/models/ChatError";
import { providerTransportError, requestAi } from "./providerHttp";

export class OpenAIQuestionEmbedder {
  constructor(private readonly apiKey: string, readonly model: string) {}

  async embed(text: string, signal?: AbortSignal): Promise<number[]> {
    if (!this.apiKey.trim()) throw new ChatError("faq_unavailable");
    const timeout = AbortSignal.timeout(15_000);
    const querySignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await requestAi("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: querySignal,
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, dimensions: 1536, input: text.slice(0, 6000), encoding_format: "float" }),
    }, "faq_unavailable");
    try {
      const payload = await response.json() as { data?: Array<{ embedding?: unknown }> };
      const vector = payload.data?.[0]?.embedding;
      if (!Array.isArray(vector) || vector.length !== 1536
        || vector.some((value) => typeof value !== "number" || !Number.isFinite(value))
        || !vector.some((value) => value !== 0)) {
        throw new Error("invalid_embedding");
      }
      return vector as number[];
    } catch (error) {
      querySignal.throwIfAborted();
      throw providerTransportError(error, "faq_unavailable");
    }
  }
}
