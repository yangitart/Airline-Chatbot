import { isSupportedLanguage } from "@/src/core/locales/supportedLanguages";
import { ChatError } from "../../domain/models/ChatError";

const MAX_BODY_BYTES = 16_384;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isConversationId(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export async function readChatMessageRequest(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new ChatError("request_too_large");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ChatError("invalid_request");

  let payload: unknown;
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let body = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) throw new ChatError("request_too_large");
      body += decoder.decode(value, { stream: true });
    }
    payload = JSON.parse(body + decoder.decode());
  } catch (error) {
    if (error instanceof ChatError) throw error;
    throw new ChatError("invalid_request", error);
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    throw new ChatError("invalid_request");
  const { conversation_id, message, language } = payload as Record<
    string,
    unknown
  >;
  if (conversation_id !== undefined && !isConversationId(conversation_id))
    throw new ChatError("invalid_request");
  if (
    typeof message !== "string" ||
    !message.trim() ||
    !isSupportedLanguage(language)
  ) {
    throw new ChatError("invalid_request");
  }
  if (message.length > 2000) throw new ChatError("message_too_long");
  return { conversationId: conversation_id, message: message.trim(), language };
}
