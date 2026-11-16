export type ChatMessageRequest = {
  conversation_id?: string;
  message: string;
  language: string;
};

export class ChatApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super("chat_api_error");
  }
}
