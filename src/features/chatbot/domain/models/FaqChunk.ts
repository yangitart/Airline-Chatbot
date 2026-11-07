import type { ChatAction } from "./ChatAction";

export type FaqChunk = {
  documentId: string;
  title: string;
  sourceCategory: string;
  sectionTitle: string;
  content: string;
  pageNumber?: number;
  similarity: number;
};

export type GroundedSource = {
  documentId: string;
  title: string;
  section: string;
  href: string;
  citationNumber?: number;
};

export type GroundedChatResponse = {
  content: string;
  sources: GroundedSource[];
  action?: ChatAction;
};

export type ChatCompletionStreamEvent =
  | { type: "delta"; content: string }
  | { type: "complete"; response: GroundedChatResponse };
