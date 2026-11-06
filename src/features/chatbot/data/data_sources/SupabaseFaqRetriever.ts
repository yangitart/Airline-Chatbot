import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FaqChunk } from "../../domain/models/FaqChunk";
import type { FaqRetriever } from "../../domain/repositories/FaqRetriever";
import { OpenAIQuestionEmbedder } from "../providers/OpenAIQuestionEmbedder";
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
  constructor(private readonly supabase: SupabaseClient, private readonly embedder: OpenAIQuestionEmbedder) {}

  async search(query: string, language: string, signal?: AbortSignal): Promise<FaqChunk[]> {
    const embedding = await this.embedder.embed(query, signal);
    const timeout = AbortSignal.timeout(10_000);
    const querySignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let data: unknown;
    try {
      const result = await this.supabase.rpc("match_faq_evidence", {
        p_query: query,
        p_query_embedding: `[${embedding.join(",")}]`,
        p_embedding_model: this.embedder.model,
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
