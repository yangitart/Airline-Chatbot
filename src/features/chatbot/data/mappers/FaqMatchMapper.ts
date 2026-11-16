import type { FaqChunk } from "../../domain/models/FaqChunk";
import type { FaqMatchRow } from "../models/FaqMatchModel";

export function mapFaqMatch(row: FaqMatchRow): FaqChunk {
  return {
    documentId: row.document_id,
    title: row.title,
    sourceCategory: row.source_category,
    sectionTitle: row.section_title,
    content: row.content,
    pageNumber: row.page_number ?? undefined,
    similarity: row.similarity,
  };
}
