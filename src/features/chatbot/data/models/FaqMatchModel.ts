export type FaqMatchRow = {
  document_id: string;
  title: string;
  source_category: string;
  section_title: string;
  content: string;
  page_number: number | null;
  similarity: number;
};
