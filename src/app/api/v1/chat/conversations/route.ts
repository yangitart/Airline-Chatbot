import { chatResponse } from "@/src/features/chatbot/data/http/chatResponses";
import { createServerChatHistory } from "@/src/features/chatbot/ioc/serverChatHistory";
import { authenticateChatRequest } from "@/src/features/chatbot/ioc/serverChatRequest";

export async function GET() {
  return chatResponse("list_conversations", async () => {
    const { supabase, userId } = await authenticateChatRequest();
    const conversations =
      await createServerChatHistory(supabase).listConversations.execute(userId);
    return Response.json(
      { conversations },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
