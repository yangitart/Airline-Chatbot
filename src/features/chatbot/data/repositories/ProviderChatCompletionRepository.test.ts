import { afterEach, expect, it, vi } from "vitest";
import type { ChatActionResult } from "../../domain/models/ChatAction";
import type { ChatTool } from "../../domain/models/ChatTool";
import { readChatAction } from "../mappers/readChatAction";
import type { ChatModelProvider } from "../providers/ChatModelProvider";
import { ProviderChatCompletionRepository } from "./ProviderChatCompletionRepository";

const bookingResult: ChatActionResult = { type: "booking_results", data: [{ id: "booking-id", reference: "AI-AB12CD34EF" }] };
const statusResult: ChatActionResult = {
  type: "flight_status_result",
  data: {
    flightNumber: "AI 101",
    flightDate: "2026-11-05",
    status: "scheduled",
    updatedAt: "2026-11-05T00:00:00Z",
    isDemo: true,
    schedule: { originCode: "DEL", destinationCode: "BOM", departureAt: "2026-11-05T00:30:00Z", arrivalAt: "2026-11-05T03:00:00Z" },
    departureTimeZone: "Asia/Kolkata",
  },
};

afterEach(() => vi.restoreAllMocks());

it("retains successful cards in order when another tool throws in the same turn", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const names = ["find_my_bookings", "search_flights", "lookup_flight_status"];
  const stream = vi.fn<ChatModelProvider["stream"]>()
    .mockImplementationOnce(async function* () {
      yield { type: "tool_calls", toolCalls: names.map((name) => ({ id: name, name, arguments: "{}" })) };
    })
    .mockImplementationOnce(async function* () {
      yield { type: "delta", content: "Here are your booking and flight status." };
    });
  const tools: ChatTool[] = [
    { definition: { name: names[0], description: "", parameters: {} }, execute: async () => ({ action: bookingResult, modelResult: {} }) },
    { definition: { name: names[1], description: "", parameters: {} }, execute: async () => { throw new Error("unavailable"); } },
    { definition: { name: names[2], description: "", parameters: {} }, execute: async () => ({ action: statusResult, modelResult: {} }) },
  ];
  const repository = new ProviderChatCompletionRepository({ stream, complete: vi.fn() }, tools);
  const response = await repository.complete([{ role: "user", content: "Show my trip and flight status." }], "en");

  expect(response.action).toEqual({ type: "action_group", data: [bookingResult, statusResult] });
  expect(stream.mock.calls[1][0]).toContainEqual(expect.objectContaining({
    role: "tool", toolCallId: names[1], content: '{"error":"tool_unavailable"}',
  }));
});

it("reads legacy cards and preserves valid members of a saved group", () => {
  expect(readChatAction(bookingResult)).toEqual(bookingResult);
  const savedGroup = { type: "action_group", data: [bookingResult, { type: "flight_status_result", data: {} }, statusResult] };
  expect(readChatAction(savedGroup)).toEqual({ type: "action_group", data: [bookingResult, statusResult] });
  expect(readChatAction({ type: "booking_results", data: [null] })).toBeUndefined();
});
