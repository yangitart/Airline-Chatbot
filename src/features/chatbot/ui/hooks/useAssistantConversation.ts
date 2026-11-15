"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import type { ChatErrorCode } from "../../domain/models/ChatError";
import type { ChatConversationSummary } from "../../domain/models/ChatHistory";
import { chatServices } from "../../ioc/chatServices";
import type { AssistantMessage } from "../types/AssistantMessage";
import { chatErrorCode } from "../utils/chatErrors";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function useAssistantConversation({
  user,
  open,
  language,
  requestSignIn,
  onAccountChange,
}: {
  user: GoogleUser | null;
  open: boolean;
  language: string;
  requestSignIn: () => void;
  onAccountChange: () => void;
}) {
  const client = chatServices.client;
  const previousUserId = useRef(user?.id ?? null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    [],
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<ChatErrorCode | null>(null);
  const [requestError, setRequestError] = useState<ChatErrorCode | null>(null);
  const [changingConversation, setChangingConversation] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const historyRequest = useRef<AbortController | null>(null);
  const [responding, setResponding] = useState(false);
  const loadHistory = useCallback(async () => {
    if (!user) return;
    historyRequest.current?.abort();
    const controller = new AbortController();
    historyRequest.current = controller;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const result = await client.listConversations(controller.signal);
      if (!controller.signal.aborted) setConversations(result);
    } catch (error) {
      if (controller.signal.aborted) return;
      const code = chatErrorCode(error, "history_unavailable");
      setHistoryError(code);
      if (code === "auth_required") requestSignIn();
    } finally {
      if (!controller.signal.aborted) setHistoryLoading(false);
    }
  }, [client, requestSignIn, user]);

  useEffect(() => {
    if (!open || !historyOpen || !user) return;
    void loadHistory();
    return () => historyRequest.current?.abort();
  }, [loadHistory, open, historyOpen, user]);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
      historyRequest.current?.abort();
    },
    [],
  );

  const clearConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setRequestError(null);
    setHistoryOpen(false);
    setPendingDeleteId(null);
  }, []);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousId = previousUserId.current;
    if (previousId === currentUserId) return;

    previousUserId.current = currentUserId;
    activeRequest.current?.abort();
    historyRequest.current?.abort();
    activeRequest.current = null;
    historyRequest.current = null;
    clearConversation();
    setConversations([]);
    setHistoryLoading(false);
    setHistoryError(null);
    setPendingDeleteId(null);
    setChangingConversation(false);
    setResponding(false);
    if (previousId) onAccountChange();
  }, [clearConversation, user?.id, onAccountChange]);

  const startNewConversation = () => {
    if (!activeRequest.current) clearConversation();
  };

  const changeConversation = async (
    run: (signal: AbortSignal) => Promise<void>,
  ) => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setChangingConversation(true);
    setHistoryError(null);
    try {
      await run(controller.signal);
    } catch (error) {
      if (controller.signal.aborted) return;
      const code = chatErrorCode(error, "history_unavailable");
      setHistoryError(code);
      if (code === "auth_required") requestSignIn();
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
      if (!controller.signal.aborted) setChangingConversation(false);
    }
  };

  const openConversation = (id: string) =>
    changeConversation(async (signal) => {
      const conversation = await client.getConversation(id, signal);
      signal.throwIfAborted();
      setConversationId(conversation.id);
      setMessages(conversation.messages.slice(-48));
      setRequestError(null);
      setHistoryOpen(false);
    });

  const deleteConversation = async (id: string) => {
    if (activeRequest.current || changingConversation) return;
    await changeConversation(async (signal) => {
      await client.deleteConversation(id, signal);
      signal.throwIfAborted();
      historyRequest.current?.abort();
      setHistoryLoading(false);
      setConversations((current) => current.filter((item) => item.id !== id));
      if (conversationId === id) clearConversation();
      setPendingDeleteId(null);
    });
  };

  const submitMessage = useCallback(
    async (values: { message: string }, helpers: { resetForm: () => void }) => {
      const content = values.message.trim();
      if (!content || activeRequest.current) return;
      if (!user) {
        requestSignIn();
        return;
      }

      const controller = new AbortController();
      activeRequest.current = controller;
      const userMessage: AssistantMessage = {
        id: newId(),
        role: "user",
        content,
      };
      const assistantMessage: AssistantMessage = {
        id: newId(),
        role: "assistant",
        content: "",
      };
      setMessages((current) => [...current, userMessage, assistantMessage]);
      setRequestError(null);
      setResponding(true);
      let pendingText = "";
      let pendingFrame: number | null = null;

      try {
        const result = await client.sendMessage(
          {
            conversationId: conversationId ?? undefined,
            message: content,
            language,
          },
          {
            signal: controller.signal,
            onDelta: (delta) => {
              pendingText += delta;
              if (pendingFrame !== null) return;
              pendingFrame = window.requestAnimationFrame(() => {
                const text = pendingText;
                pendingText = "";
                pendingFrame = null;
                if (controller.signal.aborted) return;
                setMessages((current) =>
                  current.map((item) =>
                    item.id === assistantMessage.id
                      ? { ...item, content: item.content + text }
                      : item,
                  ),
                );
              });
            },
          },
        );
        controller.signal.throwIfAborted();
        setConversationId(result.conversationId);
        setMessages((current) =>
          current
            .map((item) =>
              item.id === assistantMessage.id
                ? {
                    ...item,
                    content: result.content,
                    sources: result.sources,
                    action: result.action,
                  }
                : item,
            )
            .slice(-48),
        );
        helpers.resetForm();
      } catch (error) {
        if (controller.signal.aborted) return;
        setMessages((current) =>
          current.filter(
            (item) =>
              item.id !== userMessage.id && item.id !== assistantMessage.id,
          ),
        );
        const code = chatErrorCode(error, "unexpected_error");
        setRequestError(code);
        if (code === "auth_required") requestSignIn();
      } finally {
        if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
        if (activeRequest.current === controller) activeRequest.current = null;
        if (!controller.signal.aborted) setResponding(false);
      }
    },
    [client, conversationId, requestSignIn, language, user],
  );

  return {
    messages,
    conversations,
    historyOpen,
    setHistoryOpen,
    pendingDeleteId,
    setPendingDeleteId,
    historyLoading,
    historyError,
    requestError,
    changingConversation,
    responding,
    startNewConversation,
    openConversation,
    deleteConversation,
    submitMessage,
  };
}
