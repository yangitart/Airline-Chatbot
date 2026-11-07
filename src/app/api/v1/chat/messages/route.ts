import {
  chatEventStream,
  chatResponse,
} from "@/src/features/chatbot/data/http/chatResponses";
import { readChatMessageRequest } from "@/src/features/chatbot/data/http/chatMessageRequest";
import {
  prepareChatTurn,
  streamChatTurn,
} from "@/src/features/chatbot/domain/useCases/streamChatTurn";
import { createServerChatHistory } from "@/src/features/chatbot/ioc/serverChatHistory";
import { authenticateChatRequest } from "@/src/features/chatbot/ioc/serverChatRequest";
import { createServerTravelAssistant } from "@/src/features/chatbot/ioc/serverTravelAssistant";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return chatResponse("send_message", async () => {
    const input = await readChatMessageRequest(request);
    const { supabase } = await authenticateChatRequest();
    const history = createServerChatHistory(supabase);
    const turn = await prepareChatTurn(input, history, request.signal);
    const assistant = createServerTravelAssistant(supabase);
    const cancellation = new AbortController();
    const signal = AbortSignal.any([request.signal, cancellation.signal]);

    async function* events() {
      for await (const event of streamChatTurn(
        turn,
        assistant,
        history,
        signal,
      )) {
        if (event.type === "delta") {
          yield { event: "delta", data: { content: event.content } };
        } else {
          yield {
            event: "complete",
            data: {
              conversation_id: event.conversationId,
              message: { role: "assistant", content: event.response.content },
              sources: event.response.sources,
              action: event.response.action ?? null,
            },
          };
        }
      }
    }

    return chatEventStream(events(), cancellation, signal);
  });
}
