import { ChatError, type ChatErrorCode } from "../../domain/models/ChatError";

export const chatErrorKeys: Partial<Record<ChatErrorCode, string>> = {
  auth_required: "chatbot.authRequired",
  auth_unavailable: "chatbot.authUnavailable",
  history_unavailable: "chatbot.historyError",
  conversation_not_found: "chatbot.conversationMissing",
  faq_unavailable: "chatbot.faqUnavailable",
  provider_rate_limited: "chatbot.rateLimited",
  provider_quota_exceeded: "chatbot.quotaExceeded",
  provider_timeout: "chatbot.timeout",
  connection_interrupted: "chatbot.connectionInterrupted",
  message_too_long: "chatbot.messageTooLong",
  request_too_large: "chatbot.messageTooLong",
};

export function chatErrorCode(
  error: unknown,
  fallback: ChatErrorCode,
): ChatErrorCode {
  return error instanceof ChatError ? error.code : fallback;
}
