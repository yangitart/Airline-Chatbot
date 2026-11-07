import { chatResponse } from "@/src/features/chatbot/data/http/chatResponses";
import { isConversationId } from "@/src/features/chatbot/data/http/chatMessageRequest";
import { ChatError } from "@/src/features/chatbot/domain/models/ChatError";
import { createServerChatHistory } from "@/src/features/chatbot/ioc/serverChatHistory";
import { authenticateChatRequest } from "@/src/features/chatbot/ioc/serverChatRequest";

type Context = { params: Promise<{ conversationId: string }> };

export async function GET(_request: Request, context: Context) {
  return chatResponse("read_conversation", async () => {
    const { conversationId } = await context.params;
    if (!isConversationId(conversationId))
      throw new ChatError("conversation_not_found");
    const { supabase } = await authenticateChatRequest();
    const conversation =
      await createServerChatHistory(supabase).getConversation.execute(
        conversationId,
      );
    if (!conversation) throw new ChatError("conversation_not_found");
    return Response.json(
      { conversation },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function DELETE(_request: Request, context: Context) {
  return chatResponse("delete_conversation", async () => {
    const { conversationId } = await context.params;
    if (!isConversationId(conversationId))
      throw new ChatError("conversation_not_found");
    const { supabase } = await authenticateChatRequest();
    await createServerChatHistory(supabase).deleteConversation.execute(
      conversationId,
    );
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  });
}
