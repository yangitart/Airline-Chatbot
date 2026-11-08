import { afterEach, expect, it, vi } from "vitest";
import type { ChatActionResult } from "@/src/features/chatbot/domain/models/ChatAction";
import type { ChatTool } from "@/src/features/chatbot/domain/models/ChatTool";
import { readChatAction } from "@/src/features/chatbot/data/mappers/readChatAction";
import type { ChatModelProvider } from "@/src/features/chatbot/data/providers/ChatModelProvider";
import type { FaqRetriever } from "@/src/features/chatbot/domain/repositories/FaqRetriever";
import { ProviderChatCompletionRepository } from "@/src/features/chatbot/data/repositories/ProviderChatCompletionRepository";

const bookingResult: ChatActionResult = {
  type: "booking_results",
  data: [{ id: "booking-id", reference: "AI-AB12CD34EF" }],
};
const statusResult: ChatActionResult = {
  type: "flight_status_result",
  data: {
    flightNumber: "AI 101",
    flightDate: "2026-11-05",
    status: "scheduled",
    updatedAt: "2026-11-05T00:00:00Z",
    isDemo: true,
    schedule: {
      originCode: "DEL",
      destinationCode: "BOM",
      departureAt: "2026-11-05T00:30:00Z",
      arrivalAt: "2026-11-05T03:00:00Z",
    },
    departureTimeZone: "Asia/Kolkata",
  },
};

afterEach(() => vi.restoreAllMocks());

it("retains successful cards in order when another tool throws in the same turn", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const names = ["find_my_bookings", "search_flights", "lookup_flight_status"];
  const stream = vi
    .fn<ChatModelProvider["stream"]>()
    .mockImplementationOnce(async function* () {
      yield {
        type: "tool_calls",
        toolCalls: names.map((name) => ({ id: name, name, arguments: "{}" })),
      };
    })
    .mockImplementationOnce(async function* () {
      yield {
        type: "delta",
        content: "Here are your booking and flight status.",
      };
    });
  const tools: ChatTool[] = [
    {
      definition: { name: names[0], description: "", parameters: {} },
      execute: async () => ({ action: bookingResult, modelResult: {} }),
    },
    {
      definition: { name: names[1], description: "", parameters: {} },
      execute: async () => {
        throw new Error("unavailable");
      },
    },
    {
      definition: { name: names[2], description: "", parameters: {} },
      execute: async () => ({ action: statusResult, modelResult: {} }),
    },
  ];
  const repository = new ProviderChatCompletionRepository(
    { stream, complete: vi.fn() },
    tools,
  );
  const response = await repository.complete(
    [{ role: "user", content: "Show my trip and flight status." }],
    "en",
  );

  expect(response.action).toEqual({
    type: "action_group",
    data: [bookingResult, statusResult],
  });
  expect(stream.mock.calls[1][0]).toContainEqual(
    expect.objectContaining({
      role: "tool",
      toolCallId: names[1],
      content: '{"error":"tool_unavailable"}',
    }),
  );
});

it("reads legacy cards and preserves valid members of a saved group", () => {
  expect(readChatAction(bookingResult)).toEqual(bookingResult);
  const savedGroup = {
    type: "action_group",
    data: [
      bookingResult,
      { type: "flight_status_result", data: {} },
      statusResult,
    ],
  };
  expect(readChatAction(savedGroup)).toEqual({
    type: "action_group",
    data: [bookingResult, statusResult],
  });
  expect(
    readChatAction({ type: "booking_results", data: [null] }),
  ).toBeUndefined();
});

it("continues normal chat when FAQ retrieval fails", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const stream = vi
    .fn<ChatModelProvider["stream"]>()
    .mockImplementation(async function* () {
      yield { type: "delta", content: "I can help with your travel question." };
    });
  const faqRetriever: FaqRetriever = {
    search: vi.fn().mockRejectedValue(new Error("faq index unavailable")),
  };
  const repository = new ProviderChatCompletionRepository(
    { stream, complete: vi.fn() },
    [],
    faqRetriever,
  );

  const response = await repository.complete(
    [{ role: "user", content: "Can you help me plan my packing?" }],
    "en",
  );

  expect(response.content).toBe("I can help with your travel question.");
  expect(response.sources).toEqual([]);
  expect(stream.mock.calls[0][2]).toBe("");
  expect(faqRetriever.search).toHaveBeenCalledWith(
    "Can you help me plan my packing?",
    "en",
    undefined,
  );
  expect(console.warn).toHaveBeenCalledWith("[chat]", {
    operation: "retrieve_faq",
    code: "faq_unavailable",
  });
});

it("skips FAQ retrieval for greetings but retrieves evidence for a greeting with a question", async () => {
  const stream = vi
    .fn<ChatModelProvider["stream"]>()
    .mockImplementation(async function* () {
      yield { type: "delta", content: "Hola" };
    });
  const search = vi.fn().mockResolvedValue([]);
  const repository = new ProviderChatCompletionRepository(
    { stream, complete: vi.fn() },
    [],
    { search },
  );

  await repository.complete([{ role: "user", content: "¡Hola!" }], "es");
  expect(search).not.toHaveBeenCalled();

  const question = "¡Hola! ¿Qué equipaje puedo llevar?";
  await repository.complete([{ role: "user", content: question }], "es");
  expect(search).toHaveBeenCalledWith(question, "es", undefined);
});
