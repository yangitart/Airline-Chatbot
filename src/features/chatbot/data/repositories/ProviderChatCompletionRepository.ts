import type {
  ChatMessage,
  ChatModelStreamEvent,
  ModelMessage,
} from "../../domain/models/ChatMessage";
import type {
  ChatCompletionStreamEvent,
  GroundedChatResponse,
  GroundedSource,
} from "../../domain/models/FaqChunk";
import type { ChatCompletionRepository } from "../../domain/repositories/ChatCompletionRepository";
import type { ChatTool } from "../../domain/models/ChatTool";
import {
  MAX_CHAT_ACTIONS,
  type ChatActionResult,
} from "../../domain/models/ChatAction";
import type { FaqRetriever } from "../../domain/repositories/FaqRetriever";
import type { ChatModelProvider } from "../providers/ChatModelProvider";

const socialMessages = new Set([
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "thanks",
  "thank you",
  "hola",
  "buenos días",
  "buenas tardes",
  "buenas noches",
  "gracias",
  "bonjour",
  "bonsoir",
  "salut",
  "merci",
  "olá",
  "oi",
  "bom dia",
  "boa tarde",
  "boa noite",
  "obrigado",
  "obrigada",
  "नमस्ते",
  "नमस्कार",
  "धन्यवाद",
  "你好",
  "您好",
  "早上好",
  "晚上好",
  "谢谢",
]);

export class ProviderChatCompletionRepository implements ChatCompletionRepository {
  constructor(
    private readonly provider: ChatModelProvider,
    private readonly tools: ChatTool[],
    private readonly faqRetriever?: FaqRetriever,
  ) {}

  async complete(
    messages: ChatMessage[],
    language: string,
  ): Promise<GroundedChatResponse> {
    let response: GroundedChatResponse | undefined;
    for await (const event of this.stream(messages, language)) {
      if (event.type === "complete") response = event.response;
    }
    if (!response) throw new Error("assistant_response_missing");
    return response;
  }

  async *stream(
    messages: ChatMessage[],
    language: string,
    signal?: AbortSignal,
  ): AsyncGenerator<ChatCompletionStreamEvent> {
    const latestQuestion =
      [...messages].reverse().find((message) => message.role === "user")
        ?.content ?? "";
    const normalizedQuestion = latestQuestion
      .normalize("NFKC")
      .toLowerCase()
      .replace(/^[\p{P}\s]+|[\p{P}\s]+$/gu, "")
      .replace(/\s+/g, " ");
    const retriever =
      normalizedQuestion && !socialMessages.has(normalizedQuestion)
        ? this.faqRetriever
        : undefined;
    const chunks =
      (await retriever?.search(latestQuestion, language, signal).catch(() => {
        signal?.throwIfAborted();
        console.warn("[chat]", {
          operation: "retrieve_faq",
          code: "faq_unavailable",
        });
        return [];
      })) ?? [];
    const groundingContext = chunks.length
      ? JSON.stringify(
          chunks.map((chunk, index) => ({
            number: index + 1,
            publisher: "Veyra",
            title: chunk.title,
            section: chunk.sectionTitle,
            page: chunk.pageNumber,
            passage: chunk.content,
          })),
        )
      : "";
    const sourceList: GroundedSource[] = chunks.map((chunk, index) => ({
      documentId: chunk.documentId,
      title: chunk.title,
      section: chunk.pageNumber
        ? `${chunk.sectionTitle} · p. ${chunk.pageNumber}`
        : chunk.sectionTitle,
      href: `/faqs/${chunk.sourceCategory}`,
      citationNumber: index + 1,
    }));
    const modelMessages: ModelMessage[] = messages.map(({ role, content }) => ({
      role,
      content,
    }));
    const toolDefinitions = this.tools.map(({ definition }) => definition);
    const actions: ChatActionResult[] = [];
    let fullContent = "";
    let callsExecuted = 0;
    let needsFinalText = false;
    const providerSignal = () =>
      signal
        ? AbortSignal.any([signal, AbortSignal.timeout(25_000)])
        : AbortSignal.timeout(25_000);

    for (let round = 0; round < 3; round += 1) {
      let roundText = "";
      let toolTurn:
        | Extract<ChatModelStreamEvent, { type: "tool_calls" }>
        | undefined;
      for await (const event of this.provider.stream(
        modelMessages,
        providerSignal(),
        groundingContext,
        toolDefinitions,
        language,
      )) {
        if (event.type === "delta") {
          roundText += event.content;
          fullContent += event.content;
          yield event;
        } else {
          toolTurn = event;
        }
      }
      if (!toolTurn?.toolCalls.length) {
        needsFinalText = false;
        break;
      }

      modelMessages.push({
        role: "assistant",
        content: roundText,
        toolCalls: toolTurn.toolCalls,
        providerParts: toolTurn.providerParts,
      });
      needsFinalText = true;
      for (const toolCall of toolTurn.toolCalls) {
        const toolReply = {
          role: "tool" as const,
          toolCallId: toolCall.id,
          providerToolCallId: toolCall.providerId,
          toolName: toolCall.name,
        };
        if (callsExecuted >= MAX_CHAT_ACTIONS) {
          modelMessages.push({
            ...toolReply,
            content: JSON.stringify({ error: "tool_limit_reached" }),
          });
          continue;
        }
        const tool = this.tools.find(
          ({ definition }) => definition.name === toolCall.name,
        );
        if (!tool) {
          modelMessages.push({
            ...toolReply,
            content: JSON.stringify({ error: "unsupported_action" }),
          });
          continue;
        }
        signal?.throwIfAborted();
        callsExecuted += 1;
        try {
          const result = await tool.execute(toolCall.arguments);
          signal?.throwIfAborted();
          if (result.action) actions.push(result.action);
          modelMessages.push({
            ...toolReply,
            content: JSON.stringify(result.modelResult),
          });
        } catch {
          signal?.throwIfAborted();
          console.warn("[chat]", {
            operation: tool.definition.name,
            code: "tool_unavailable",
          });
          modelMessages.push({
            ...toolReply,
            content: JSON.stringify({ error: "tool_unavailable" }),
          });
        }
      }
    }

    if (needsFinalText) {
      for await (const event of this.provider.stream(
        modelMessages,
        providerSignal(),
        groundingContext,
        [],
        language,
      )) {
        if (event.type === "delta") {
          fullContent += event.content;
          yield event;
        }
      }
    }

    const cited = new Set(
      Array.from(fullContent.matchAll(/\[(\d+)\]/g), (match) =>
        Number(match[1]),
      ),
    );
    yield {
      type: "complete",
      response: {
        content: fullContent.trim(),
        sources: sourceList.filter(
          (source) =>
            source.citationNumber !== undefined &&
            cited.has(source.citationNumber),
        ),
        action:
          actions.length > 1
            ? { type: "action_group", data: actions }
            : actions[0],
      },
    };
  }
}
