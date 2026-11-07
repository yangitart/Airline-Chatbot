import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ChatConversation,
  ChatConversationSummary,
  SaveChatTurnCommand,
  SavedChatMessage,
} from "../../domain/models/ChatHistory";
import type { ChatMessage } from "../../domain/models/ChatMessage";
import type { ChatHistoryRepository } from "../../domain/repositories/ChatHistoryRepository";
import { ChatError } from "../../domain/models/ChatError";
import { readChatAction } from "../mappers/readChatAction";

type ConversationRow = { id: string; title: string; updated_at: string };
type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: unknown;
  action: unknown;
  created_at: string;
};

function mapSources(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    if (
      typeof source.documentId !== "string" ||
      typeof source.title !== "string" ||
      typeof source.section !== "string" ||
      typeof source.href !== "string"
    )
      return [];
    if (!/^\/faqs\/[a-z0-9-]+$/.test(source.href)) return [];
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

export class SupabaseChatHistoryDataSource implements ChatHistoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async query<T>(
    run: () => PromiseLike<{
      data: T;
      error: { code: string; message: string } | null;
    }>,
  ) {
    try {
      const { data, error } = await run();
      if (
        error?.code === "42501" &&
        error.message === "conversation_not_found"
      ) {
        throw new ChatError("conversation_not_found");
      }
      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError("history_unavailable", error);
    }
  }

  async listConversations(userId: string): Promise<ChatConversationSummary[]> {
    const data = await this.query(() =>
      this.supabase
        .from("chat_conversations")
        .select("id,title,updated_at")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50)
        .abortSignal(AbortSignal.timeout(10_000)),
    );
    return ((data ?? []) as ConversationRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      updatedAt: row.updated_at,
    }));
  }

  private async readConversation<Message extends ChatMessage>(
    conversationId: string,
    messageColumns: string,
    limit: number,
    signal?: AbortSignal,
  ) {
    const timeout = AbortSignal.timeout(10_000);
    const referencedTable = "chat_messages";
    const data = await this.query(() =>
      this.supabase
        .from("chat_conversations")
        .select(`id,title,updated_at,chat_messages(${messageColumns})`)
        .eq("id", conversationId)
        .order("created_at", { referencedTable, ascending: false })
        .order("role", { referencedTable, ascending: true })
        .order("id", { referencedTable })
        .limit(limit, { referencedTable })
        .abortSignal(signal ? AbortSignal.any([signal, timeout]) : timeout)
        .maybeSingle(),
    );
    return data as (ConversationRow & { chat_messages: Message[] }) | null;
  }

  async getConversationContext(
    conversationId: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<ChatMessage[] | null> {
    const conversation = await this.readConversation<ChatMessage>(
      conversationId,
      "role,content",
      limit,
      signal,
    );
    return conversation ? conversation.chat_messages.reverse() : null;
  }

  async getConversation(
    conversationId: string,
  ): Promise<ChatConversation | null> {
    const conversation = await this.readConversation<MessageRow>(
      conversationId,
      "id,role,content,sources,action,created_at",
      100,
    );
    if (!conversation) return null;

    const messages = conversation.chat_messages.reverse().map(
      (row): SavedChatMessage => ({
        id: row.id,
        role: row.role,
        content: row.content,
        sources: mapSources(row.sources),
        action: readChatAction(row.action),
        createdAt: row.created_at,
      }),
    );
    return {
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updated_at,
      messages,
    };
  }

  async deleteConversation(conversationId: string) {
    await this.query(() =>
      this.supabase
        .from("chat_conversations")
        .delete()
        .eq("id", conversationId)
        .abortSignal(AbortSignal.timeout(10_000)),
    );
  }

  async saveTurn(command: SaveChatTurnCommand) {
    const data = await this.query(() =>
      this.supabase
        .rpc("save_chat_turn", {
          p_conversation_id: command.conversationId ?? null,
          p_title: command.title,
          p_user_message: command.userMessage,
          p_assistant_message: command.assistantMessage,
          p_sources: command.sources ?? [],
          p_action: command.action ?? null,
        })
        .abortSignal(AbortSignal.timeout(10_000)),
    );
    if (typeof data !== "string") throw new ChatError("history_unavailable");
    return data;
  }
}
