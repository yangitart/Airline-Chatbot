import { ChatError } from "../../domain/models/ChatError";
import type { FaqRetriever } from "../../domain/repositories/FaqRetriever";
import type { SupabaseFaqDataSource } from "../data_sources/SupabaseFaqDataSource";
import type { GeminiFaqEmbeddingProvider } from "../providers/GeminiFaqEmbeddingProvider";
import { mapFaqMatch } from "../mappers/FaqMatchMapper";

const MINIMUM_FAQ_SIMILARITY = 0.52;

export function FaqRetrieverImpl(
  dataSource: Pick<SupabaseFaqDataSource, "search">,
  embeddings: Pick<GeminiFaqEmbeddingProvider, "embedQuery">,
): FaqRetriever {
  return {
    async search(query, language, signal) {
      try {
        signal?.throwIfAborted();
        const timeout = AbortSignal.timeout(10_000);
        const querySignal = signal
          ? AbortSignal.any([signal, timeout])
          : timeout;
        const embedding = await embeddings.embedQuery(query, querySignal);
        const rows = await dataSource.search(
          query,
          embedding,
          language === "es" ? "es" : "en",
          querySignal,
        );
        return rows
          .filter((row) => row.similarity >= MINIMUM_FAQ_SIMILARITY)
          .map(mapFaqMatch);
      } catch (error) {
        signal?.throwIfAborted();
        throw new ChatError("faq_unavailable", error);
      }
    },
  };
}
