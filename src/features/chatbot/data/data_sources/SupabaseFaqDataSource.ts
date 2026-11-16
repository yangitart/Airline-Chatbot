import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  faqEmbeddingModel,
  toFaqVectorLiteral,
} from "../providers/geminiFaqEmbeddings.mjs";
import type { FaqMatchRow } from "../models/FaqMatchModel";

export const SupabaseFaqDataSourceImpl = (supabase: SupabaseClient) => {
  async function search(
    query: string,
    embedding: number[],
    language: string,
    signal: AbortSignal,
  ): Promise<FaqMatchRow[]> {
    const { data, error } = await supabase
      .rpc("match_faq_evidence", {
        p_query: query,
        p_query_embedding: toFaqVectorLiteral(embedding),
        p_embedding_model: faqEmbeddingModel,
        p_match_count: 6,
        p_language: language,
      })
      .abortSignal(signal);
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("invalid_faq_response");
    return data as FaqMatchRow[];
  }
  return { search };
};

export type SupabaseFaqDataSource = ReturnType<
  typeof SupabaseFaqDataSourceImpl
>;
