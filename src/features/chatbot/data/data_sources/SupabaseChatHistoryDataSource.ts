import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SaveChatTurnCommand } from "../../domain/models/ChatHistory";
import type {
  ChatContextRow,
  ChatConversationRow,
  ChatConversationWithMessages,
  ChatMessageRow,
} from "../models/ChatHistoryModel";

export const SupabaseChatHistoryDataSourceImpl = (supabase: SupabaseClient) => {
  async function query<T>(run: () => PromiseLike<{ data: T; error: unknown }>) {
    const { data, error } = await run();
    if (error) throw error;
    return data;
  }

  async function listConversations(userId: string) {
    const data = await query(() =>
      supabase
        .from("chat_conversations")
        .select("id,title,updated_at")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50)
        .abortSignal(AbortSignal.timeout(10_000)),
    );
    return (data ?? []) as ChatConversationRow[];
  }

  async function readConversation<Row>(
    conversationId: string,
    messageColumns: string,
    limit: number,
    signal?: AbortSignal,
  ) {
    const timeout = AbortSignal.timeout(10_000);
    const referencedTable = "chat_messages";
    const data = await query(() =>
      supabase
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
    return data as ChatConversationWithMessages<Row> | null;
  }

  function getConversationContext(
    conversationId: string,
    limit: number,
    signal?: AbortSignal,
  ) {
    return readConversation<ChatContextRow>(
      conversationId,
      "role,content",
      limit,
      signal,
    );
  }

  function getConversation(conversationId: string) {
    return readConversation<ChatMessageRow>(
      conversationId,
      "id,role,content,sources,action,created_at",
      100,
    );
  }

  async function deleteConversation(conversationId: string) {
    await query(() =>
      supabase
        .from("chat_conversations")
        .delete()
        .eq("id", conversationId)
        .abortSignal(AbortSignal.timeout(10_000)),
    );
  }

  function saveTurn(command: SaveChatTurnCommand) {
    return query(() =>
      supabase
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
  }
  return {
    listConversations,
    getConversationContext,
    getConversation,
    deleteConversation,
    saveTurn,
  };
};

export type SupabaseChatHistoryDataSource = ReturnType<
  typeof SupabaseChatHistoryDataSourceImpl
>;
