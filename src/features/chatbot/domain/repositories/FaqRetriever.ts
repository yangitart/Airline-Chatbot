import type { FaqChunk } from "../models/FaqChunk";

export interface FaqRetriever {
  search(
    query: string,
    language: string,
    signal?: AbortSignal,
  ): Promise<FaqChunk[]>;
}
