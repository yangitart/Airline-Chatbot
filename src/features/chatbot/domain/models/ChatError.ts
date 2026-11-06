export const chatErrorStatus = {
  invalid_request: 400,
  message_too_long: 413,
  conversation_too_long: 413,
  request_too_large: 413,
  auth_required: 401,
  conversation_not_found: 404,
  auth_unavailable: 503,
  history_unavailable: 503,
  faq_unavailable: 503,
  assistant_unavailable: 503,
  provider_rate_limited: 503,
  provider_quota_exceeded: 503,
  provider_timeout: 504,
  invalid_provider_response: 502,
  connection_interrupted: 502,
  unexpected_error: 500,
} as const;

export type ChatErrorCode = keyof typeof chatErrorStatus;

export function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return typeof value === "string" && Object.hasOwn(chatErrorStatus, value);
}

export class ChatError extends Error {
  constructor(public readonly code: ChatErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "ChatError";
  }
}
