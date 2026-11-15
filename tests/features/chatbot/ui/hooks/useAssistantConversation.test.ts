import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ChatClient } from "@/src/features/chatbot/domain/repositories/ChatClient";
import { ChatError } from "@/src/features/chatbot/domain/models/ChatError";
import { useAssistantConversation } from "@/src/features/chatbot/ui/hooks/useAssistantConversation";

const client = vi.hoisted(() => ({
  sendMessage: vi.fn<ChatClient["sendMessage"]>(),
  listConversations: vi.fn<ChatClient["listConversations"]>(),
  getConversation: vi.fn<ChatClient["getConversation"]>(),
  deleteConversation: vi.fn<ChatClient["deleteConversation"]>(),
}));
vi.mock("@/src/features/chatbot/ioc/chatServices", () => ({ chatServices: { client } }));

const user = { id: "owner", email: "owner@example.com", name: "Traveler", picture: "" };
const answer = { conversationId: "conversation", content: "Your answer", sources: [] };
const requestSignIn = vi.fn();
const onAccountChange = vi.fn();
const helpers = { resetForm: vi.fn() };
function useConversation(account = user) {
  return useAssistantConversation({ user: account, open: true, language: "es", requestSignIn, onAccountChange });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => { vi.resetAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("streams partial text, prevents overlapping sends and finalizes the saved answer", async () => {
  const response = deferred<typeof answer>();
  client.sendMessage.mockReturnValue(response.promise);
  let frame!: FrameRequestCallback;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { frame = callback; return 1; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  const { result } = renderHook(() => useConversation());
  let pending!: Promise<void>;
  act(() => { pending = result.current.submitMessage({ message: "  Hola  " }, helpers); });
  expect(result.current.responding).toBe(true);
  expect(client.sendMessage.mock.calls[0][0]).toEqual({ message: "Hola", language: "es", conversationId: undefined });
  act(() => {
    client.sendMessage.mock.calls[0][1].onDelta("Partial answer");
    frame(0);
  });
  expect(result.current.messages.at(-1)?.content).toBe("Partial answer");
  await act(async () => { await result.current.submitMessage({ message: "Duplicate" }, helpers); });
  expect(client.sendMessage).toHaveBeenCalledTimes(1);
  await act(async () => { response.resolve(answer); await pending; });
  expect(result.current.responding).toBe(false);
  expect(result.current.messages.map(({ content }) => content)).toEqual(["Hola", "Your answer"]);
  expect(helpers.resetForm).toHaveBeenCalledTimes(1);
});

it("aborts in-flight messages and ignores their result after an account change", async () => {
  const response = deferred<typeof answer>();
  client.sendMessage.mockReturnValue(response.promise);
  const { result, rerender } = renderHook(({ account }) => useConversation(account), { initialProps: { account: user } });
  let pending!: Promise<void>;
  act(() => { pending = result.current.submitMessage({ message: "Private message" }, helpers); });
  const signal = client.sendMessage.mock.calls[0][1].signal;
  rerender({ account: { ...user, id: "other-owner" } });
  expect(signal.aborted).toBe(true);
  expect(result.current.messages).toEqual([]);
  expect(onAccountChange).toHaveBeenCalledTimes(1);
  await act(async () => { response.resolve(answer); await pending; });
  expect(result.current.messages).toEqual([]);
  expect(helpers.resetForm).not.toHaveBeenCalled();
});

it("removes optimistic messages and requests sign-in when the session expires", async () => {
  client.sendMessage.mockRejectedValue(new ChatError("auth_required"));
  const { result } = renderHook(() => useConversation());
  await act(async () => { await result.current.submitMessage({ message: "Hello" }, helpers); });
  expect(result.current.messages).toEqual([]);
  expect(result.current.requestError).toBe("auth_required");
  expect(result.current.responding).toBe(false);
  expect(requestSignIn).toHaveBeenCalledTimes(1);
  expect(helpers.resetForm).not.toHaveBeenCalled();
});

it("loads history only when requested and clears the active conversation after deletion", async () => {
  const summary = { id: "conversation", title: "My trip", updatedAt: "2026-11-15T12:00:00Z" };
  client.listConversations.mockResolvedValue([summary]);
  client.getConversation.mockResolvedValue({ ...summary, messages: [{ id: "saved", role: "assistant", content: "Saved answer", sources: [], createdAt: summary.updatedAt }] });
  client.deleteConversation.mockResolvedValue(undefined);
  const { result } = renderHook(() => useConversation());
  expect(client.listConversations).not.toHaveBeenCalled();
  act(() => { result.current.setHistoryOpen(true); });
  await waitFor(() => expect(result.current.conversations).toEqual([summary]));
  await act(async () => { await result.current.openConversation(summary.id); });
  expect(result.current.historyOpen).toBe(false);
  expect(result.current.messages[0].content).toBe("Saved answer");
  act(() => { result.current.setPendingDeleteId(summary.id); });
  await act(async () => { await result.current.deleteConversation(summary.id); });
  expect(result.current.messages).toEqual([]);
  expect(result.current.conversations).toEqual([]);
  expect(result.current.pendingDeleteId).toBeNull();
});
