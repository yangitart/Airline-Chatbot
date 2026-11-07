"use client";

import { useEffect } from "react";

const RELOAD_KEY = "airline-chatbot:last-chunk-reload";
const RELOAD_COOLDOWN_MS = 60_000;

function isChunkLoadFailure(value: unknown): boolean {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : "";

  return /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    message,
  );
}

export default function ChunkErrorReloader() {
  useEffect(() => {
    const reloadOnce = (reason: unknown) => {
      if (!isChunkLoadFailure(reason)) return;

      try {
        const lastReload = Number(window.sessionStorage.getItem(RELOAD_KEY));
        if (lastReload && Date.now() - lastReload < RELOAD_COOLDOWN_MS) return;
        window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        // Reload once even when session storage is unavailable.
      }

      window.location.reload();
    };

    const handleError = (event: ErrorEvent) =>
      reloadOnce(event.error ?? event.message);
    const handleRejection = (event: PromiseRejectionEvent) =>
      reloadOnce(event.reason);

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
