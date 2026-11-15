"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ASSISTANT_GREETING_STORAGE_KEY = "veyra-assistant-greeting-seen";
const FAQ_GREETING_STORAGE_KEY = "veyra-faq-assistant-greeting-seen";
const ASSISTANT_GREETING_DURATION_MS = 4_500;
const ASSISTANT_GREETING_FADE_MS = 220;

export function useAssistantGreeting(pathname: string) {
  const [assistantGreetingPhase, setAssistantGreetingPhase] = useState<
    "hidden" | "visible" | "fading"
  >("hidden");
  const [assistantGreetingCycle, setAssistantGreetingCycle] = useState(0);
  const faqGreetingShown = useRef(false);
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(ASSISTANT_GREETING_STORAGE_KEY)) return;
      window.sessionStorage.setItem(ASSISTANT_GREETING_STORAGE_KEY, "true");
    } catch {
      // Keep the one-time greeting scoped to this mount when storage is unavailable.
    }
    setAssistantGreetingPhase("visible");
  }, []);

  useEffect(() => {
    const showFaqGreetingOnce = () => {
      if (faqGreetingShown.current) return;
      faqGreetingShown.current = true;
      try {
        if (window.sessionStorage.getItem(FAQ_GREETING_STORAGE_KEY)) return;
        window.sessionStorage.setItem(FAQ_GREETING_STORAGE_KEY, "true");
      } catch {
        // Keep the FAQ greeting scoped to this mount when storage is unavailable.
      }
      setAssistantGreetingCycle((cycle) => cycle + 1);
      setAssistantGreetingPhase("visible");
    };

    if (pathname.startsWith("/faqs/")) {
      showFaqGreetingOnce();
      return;
    }
    if (pathname !== "/") return;

    const faqSection = document.getElementById("faqs");
    if (!faqSection) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        showFaqGreetingOnce();
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(faqSection);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (assistantGreetingPhase !== "visible") return;
    const timeout = window.setTimeout(
      () => setAssistantGreetingPhase("fading"),
      ASSISTANT_GREETING_DURATION_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [assistantGreetingCycle, assistantGreetingPhase]);

  useEffect(() => {
    if (assistantGreetingPhase !== "fading") return;
    const timeout = window.setTimeout(
      () => setAssistantGreetingPhase("hidden"),
      ASSISTANT_GREETING_FADE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [assistantGreetingPhase]);

  const dismissGreeting = useCallback(() => {
    setAssistantGreetingPhase((phase) =>
      phase === "hidden" ? "hidden" : "fading",
    );
  }, []);
  return { assistantGreetingPhase, dismissGreeting };
}
