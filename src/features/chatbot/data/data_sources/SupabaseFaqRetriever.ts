import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FaqChunk } from "../../domain/models/FaqChunk";
import type { FaqRetriever } from "../../domain/repositories/FaqRetriever";
import { embedFaqText, faqEmbeddingModel } from "../providers/localFaqEmbeddings.mjs";
import { ChatError } from "../../domain/models/ChatError";

type FaqMatchRow = {
  document_id: string;
  title: string;
  source_category: string;
  section_title: string;
  content: string;
  page_number: number | null;
  similarity: number;
};

export class SupabaseFaqRetriever implements FaqRetriever {
  constructor(private readonly supabase: SupabaseClient) {}

  async search(query: string, language: string, signal?: AbortSignal): Promise<FaqChunk[]> {
    let data: unknown;
    try {
      signal?.throwIfAborted();
      const embedding = embedFaqText(query);
      if (!embedding.some((value) => value !== 0)) return [];
      const timeout = AbortSignal.timeout(10_000);
      const querySignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
      const result = await this.supabase.rpc("match_faq_evidence", {
        p_query: query,
        p_query_embedding: `[${embedding.join(",")}]`,
        p_embedding_model: faqEmbeddingModel,
        p_match_count: 6,
        p_language: language === "es" ? "es" : "en",
      }).abortSignal(querySignal);
      if (result.error) throw result.error;
      data = result.data;
    } catch (error) {
      signal?.throwIfAborted();
      throw new ChatError("faq_unavailable", error);
    }
    if (!Array.isArray(data)) throw new ChatError("faq_unavailable");
    return (data as FaqMatchRow[]).map((row) => ({
      documentId: row.document_id,
      title: row.title,
      sourceCategory: row.source_category,
      sectionTitle: row.section_title,
      content: row.content,
      pageNumber: row.page_number ?? undefined,
      similarity: row.similarity,
    }));
  }
}
