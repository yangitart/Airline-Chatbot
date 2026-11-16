import "server-only";

import { embedFaqText } from "./geminiFaqEmbeddings.mjs";

export function GeminiFaqEmbeddingProviderImpl(apiKey: string) {
  function embedQuery(query: string, signal: AbortSignal): Promise<number[]> {
    return embedFaqText(query, {
      apiKey: apiKey,
      taskType: "RETRIEVAL_QUERY",
      signal,
    });
  }
  return { embedQuery };
}

export type GeminiFaqEmbeddingProvider = ReturnType<
  typeof GeminiFaqEmbeddingProviderImpl
>;
