import type { ChatActionResult } from "./ChatAction";
import type { ChatToolDefinition } from "./ChatMessage";

export type ChatTool = {
  definition: ChatToolDefinition;
  execute(
    argumentsJson: string,
  ): Promise<{ action?: ChatActionResult; modelResult: object }>;
};
