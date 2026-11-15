import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useAssistantGreeting } from "@/src/features/chatbot/ui/hooks/useAssistantGreeting";

beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("shows the initial greeting once per session and preserves its fade timing", () => {
  const first = renderHook(() => useAssistantGreeting("/profile"));
  expect(first.result.current.assistantGreetingPhase).toBe("visible");
  act(() => { vi.advanceTimersByTime(4500); });
  expect(first.result.current.assistantGreetingPhase).toBe("fading");
  act(() => { vi.advanceTimersByTime(220); });
  expect(first.result.current.assistantGreetingPhase).toBe("hidden");
  first.unmount();
  const second = renderHook(() => useAssistantGreeting("/profile"));
  expect(second.result.current.assistantGreetingPhase).toBe("hidden");
});

it("allows one FAQ greeting after the first greeting and dismisses it on interaction", () => {
  const { result, rerender } = renderHook(({ pathname }) => useAssistantGreeting(pathname), { initialProps: { pathname: "/profile" } });
  act(() => { vi.advanceTimersByTime(4500); });
  act(() => { vi.advanceTimersByTime(220); });
  rerender({ pathname: "/faqs/baggage" });
  expect(result.current.assistantGreetingPhase).toBe("visible");
  act(() => { result.current.dismissGreeting(); });
  expect(result.current.assistantGreetingPhase).toBe("fading");
  act(() => { vi.advanceTimersByTime(220); });
  rerender({ pathname: "/faqs/check-in" });
  expect(result.current.assistantGreetingPhase).toBe("hidden");
});
