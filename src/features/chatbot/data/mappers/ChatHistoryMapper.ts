import type {
  ChatConversation,
  ChatConversationSummary,
} from "../../domain/models/ChatHistory";
import type {
  ChatConversationRow,
  ChatConversationWithMessages,
} from "../models/ChatHistoryModel";
import { readChatAction } from "./readChatAction";

export function mapChatSources(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    if (
      typeof source.documentId !== "string" ||
      typeof source.title !== "string" ||
      typeof source.section !== "string" ||
      typeof source.href !== "string" ||
      !/^\/faqs\/[a-z0-9-]+$/.test(source.href)
    )
      return [];
    return [
      {
        documentId: source.documentId,
        title: source.title,
        section: source.section,
        href: source.href,
        citationNumber:
          typeof source.citationNumber === "number"
            ? source.citationNumber
            : undefined,
      },
    ];
  });
}

export function mapChatConversationSummary(
  row: ChatConversationRow,
): ChatConversationSummary {
  return { id: row.id, title: row.title, updatedAt: row.updated_at };
}

export function mapChatConversation(
  row: ChatConversationWithMessages,
): ChatConversation {
  return {
    ...mapChatConversationSummary(row),
    messages: [...row.chat_messages].reverse().map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      sources: mapChatSources(message.sources),
      action: readChatAction(message.action),
      createdAt: message.created_at,
    })),
  };
}
