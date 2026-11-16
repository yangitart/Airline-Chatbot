export type ChatConversationRow = {
  id: string;
  title: string;
  updated_at: string;
};
export type ChatContextRow = { role: "user" | "assistant"; content: string };
export type ChatMessageRow = ChatContextRow & {
  id: string;
  sources: unknown;
  action: unknown;
  created_at: string;
};
export type ChatConversationWithMessages<Row = ChatMessageRow> =
  ChatConversationRow & { chat_messages: Row[] };
