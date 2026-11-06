export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  language: string;
};

export type ModelToolCall = {
  id: string;
  name: string;
  arguments: string;
  providerId?: string;
};

export type ModelMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ModelToolCall[];
  toolCallId?: string;
  toolName?: string;
  providerToolCallId?: string;
  providerParts?: ReadonlyArray<Record<string, unknown>>;
};

export type ChatToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ChatModelResponse = {
  content: string;
  toolCalls: ModelToolCall[];
};

export type ChatModelStreamEvent =
  | { type: "delta"; content: string }
  | { type: "tool_calls"; toolCalls: ModelToolCall[]; providerParts?: ReadonlyArray<Record<string, unknown>> };
