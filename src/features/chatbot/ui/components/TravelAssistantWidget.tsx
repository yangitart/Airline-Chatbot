"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Field, Form, Formik, useFormikContext } from "formik";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, BriefcaseBusiness, History, Luggage, MessageCircle, Minus, Plane, Plus, RotateCcw, Sparkles, TicketCheck, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { useTravelShell } from "@/src/components/layout/TravelShellContext";
import { supportedLanguages } from "@/src/core/locales/supportedLanguages";
import { injector } from "@/src/ioc/utils/injector";
import { ChatError, type ChatErrorCode } from "../../domain/models/ChatError";
import type { ChatConversationSummary } from "../../domain/models/ChatHistory";
import type { GroundedChatResponse } from "../../domain/models/FaqChunk";
import type { ChatClient } from "../../domain/repositories/ChatClient";
import { CHAT_CLIENT } from "../../ioc/ChatModule";
import type { ChatMessage } from "../../domain/models/ChatMessage";
import { ChatActionCards } from "./TripActionCards";
import styles from "./TravelAssistantWidget.module.css";

type DisplayMessage = ChatMessage & { id: string } & Partial<Pick<GroundedChatResponse, "sources" | "action">>;

const errorKeys: Partial<Record<ChatErrorCode, string>> = {
  auth_required: "chatbot.authRequired",
  auth_unavailable: "chatbot.authUnavailable",
  history_unavailable: "chatbot.historyError",
  conversation_not_found: "chatbot.conversationMissing",
  faq_unavailable: "chatbot.faqUnavailable",
  provider_rate_limited: "chatbot.rateLimited",
  provider_quota_exceeded: "chatbot.quotaExceeded",
  provider_timeout: "chatbot.timeout",
  connection_interrupted: "chatbot.connectionInterrupted",
  message_too_long: "chatbot.messageTooLong",
  request_too_large: "chatbot.messageTooLong",
};

function chatErrorCode(error: unknown, fallback: ChatErrorCode): ChatErrorCode {
  return error instanceof ChatError ? error.code : fallback;
}

const promptKeys = ["prepare", "flightStatus", "findFlight"] as const;
const promptIcons = [Sparkles, Plane, TicketCheck] as const;
const topicKeys = ["newBooking", "manageBooking", "checkIn", "baggage", "flightStatus"] as const;
const topicIcons = [Plane, BriefcaseBusiness, TicketCheck, Luggage, RotateCcw] as const;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function TravelAssistantWidget() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const selectedLanguage = supportedLanguages.find((language) => language.code === i18n.resolvedLanguage) ?? supportedLanguages[0];
  const { user, authLoading, openSignIn } = useTravelShell();
  const [client] = useState(() => injector<ChatClient>(CHAT_CLIENT));
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<ChatErrorCode | null>(null);
  const [requestError, setRequestError] = useState<ChatErrorCode | null>(null);
  const [changingConversation, setChangingConversation] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const historyRequest = useRef<AbortController | null>(null);
  const [responding, setResponding] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const submitPromptRef = useRef<(prompt: string) => void>(() => undefined);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }, []);

  const requestSignIn = useCallback(() => {
    setOpen(false);
    openSignIn();
  }, [openSignIn]);

  const registerSubmitPrompt = useCallback((submit: (prompt: string) => void) => {
    submitPromptRef.current = submit;
  }, []);

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

  useEffect(() => () => {
    activeRequest.current?.abort();
    historyRequest.current?.abort();
  }, []);

  const clearConversation = () => {
    setConversationId(null);
    setMessages([]);
    setRequestError(null);
    setHistoryOpen(false);
  };

  const startNewConversation = () => {
    if (!activeRequest.current) clearConversation();
  };

  const changeConversation = async (run: (signal: AbortSignal) => Promise<void>) => {
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
      activeRequest.current = null;
      if (!controller.signal.aborted) setChangingConversation(false);
    }
  };

  const openConversation = (id: string) => changeConversation(async (signal) => {
    const conversation = await client.getConversation(id, signal);
    signal.throwIfAborted();
    setConversationId(conversation.id);
    setMessages(conversation.messages.slice(-48));
    setRequestError(null);
    setHistoryOpen(false);
  });

  const deleteConversation = async (id: string) => {
    if (activeRequest.current || !window.confirm(t("chatbot.confirmDelete"))) return;
    await changeConversation(async (signal) => {
      await client.deleteConversation(id, signal);
      signal.throwIfAborted();
      historyRequest.current?.abort();
      setHistoryLoading(false);
      setConversations((current) => current.filter((item) => item.id !== id));
      if (conversationId === id) clearConversation();
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href]");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button:not([disabled]), textarea:not([disabled])")?.focus());
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
    };
  }, [close, open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages]);

  const submitMessage = useCallback(async (values: { message: string }, helpers: { resetForm: () => void }) => {
    const content = values.message.trim();
    if (!content || activeRequest.current) return;
    if (!user) {
      requestSignIn();
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    const userMessage: DisplayMessage = { id: newId(), role: "user", content };
    const assistantMessage: DisplayMessage = { id: newId(), role: "assistant", content: "" };
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setRequestError(null);
    setResponding(true);
    let pendingText = "";
    let pendingFrame: number | null = null;

    try {
      const result = await client.sendMessage(
        { conversationId: conversationId ?? undefined, message: content, language: selectedLanguage.code },
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
              setMessages((current) => current.map((item) =>
                item.id === assistantMessage.id ? { ...item, content: item.content + text } : item,
              ));
            });
          },
        },
      );
      controller.signal.throwIfAborted();
      setConversationId(result.conversationId);
      setMessages((current) => current.map((item) => item.id === assistantMessage.id ? {
        ...item,
        content: result.content,
        sources: result.sources,
        action: result.action,
      } : item).slice(-48));
      helpers.resetForm();
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessages((current) => current.filter((item) => item.id !== userMessage.id && item.id !== assistantMessage.id));
      const code = chatErrorCode(error, "unexpected_error");
      setRequestError(code);
      if (code === "auth_required") requestSignIn();
    } finally {
      if (pendingFrame !== null) window.cancelAnimationFrame(pendingFrame);
      activeRequest.current = null;
      if (!controller.signal.aborted) setResponding(false);
    }
  }, [client, conversationId, requestSignIn, selectedLanguage.code, user]);

  const handleTopic = (key: (typeof topicKeys)[number]) => {
    if (!user) {
      requestSignIn();
      return;
    }
    const promptByKey: Record<(typeof topicKeys)[number], string> = {
      newBooking: t("chatbot.topicPrompts.newBooking"),
      manageBooking: t("chatbot.topicPrompts.manageBooking"),
      checkIn: t("chatbot.topicPrompts.checkIn"),
      baggage: t("chatbot.topicPrompts.baggage"),
      flightStatus: t("chatbot.topicPrompts.flightStatus"),
    };
    submitPromptRef.current(promptByKey[key]);
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-label={t("chatbot.launcher")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={pathname === "/"
          ? "fixed bottom-5 right-5 z-[60] grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/70 bg-airline-forest text-white shadow-[0_10px_28px_rgb(24_61_55_/_28%)] transition hover:-translate-y-1 hover:bg-airline-night focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-airline-gold sm:bottom-6 sm:right-6"
          : "relative grid size-9 shrink-0 place-items-center rounded-full border border-airline-gold/70 bg-airline-forest text-white transition-shadow hover:ring-2 hover:ring-airline-gold/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold"}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full" aria-hidden="true"><Image src="/images/veyra-assistant-avatar.webp" alt="" width={56} height={56} priority={pathname === "/"} unoptimized className={`${styles.avatarPortrait} ${responding ? styles.avatarThinking : ""} h-full w-full object-cover`} /></span>
        <MessageCircle className="absolute bottom-0.5 right-0.5 size-4 rounded-full bg-airline-paper p-0.5 text-airline-forest" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[80] flex items-end justify-end sm:p-4 lg:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <button type="button" aria-label={t("chatbot.close")} onClick={close} className={`${styles.backdrop} absolute inset-0 cursor-default`} />
          <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="veyra-chat-title" className={`${styles.panel} relative z-[1] flex h-[100dvh] w-full flex-col overflow-hidden bg-airline-canvas text-airline-ink sm:h-[min(820px,calc(100dvh-32px))] sm:max-w-[480px] sm:rounded-[28px] lg:max-h-[calc(100dvh-48px)]`}>
            <header className={`${styles.brandHeader} relative flex shrink-0 items-center gap-3 px-5 pb-5 pt-5 text-white sm:px-6 sm:pb-6`}>
              <svg className={styles.routeMotif} viewBox="0 0 220 150" aria-hidden="true">
                <circle className={styles.arc} cx="164" cy="74" r="55" />
                <circle className={styles.arc} cx="164" cy="74" r="43" />
                <path d="M18 112 C64 102 69 44 111 54 S157 120 205 28" />
                <circle cx="18" cy="112" r="2.5" />
                <circle cx="111" cy="54" r="2.5" />
                <circle cx="205" cy="28" r="2.5" />
              </svg>
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-airline-gold/70 bg-white/[.08] font-serif text-2xl font-semibold text-airline-gold shadow-[inset_0_0_18px_rgba(255,255,255,.06)]" aria-hidden="true">V</div>
              <div className="min-w-0 flex-1">
                <h2 id="veyra-chat-title" className="truncate text-lg font-semibold tracking-tight">{t("chatbot.title")}</h2>
                <p className="mt-0.5 text-xs text-white/75">{t("chatbot.subtitle")}</p>
              </div>
              <button type="button" aria-label={t("chatbot.clearChat")} title={t("chatbot.clearChat")} disabled={responding || changingConversation} onClick={startNewConversation} className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Plus className="h-4 w-4" /></button>
              <button type="button" aria-label={t("chatbot.historyTitle")} title={t("chatbot.historyTitle")} disabled={responding || changingConversation} onClick={() => user ? setHistoryOpen((value) => !value) : requestSignIn()} className={`rounded-full p-2 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${historyOpen ? "bg-white/15 text-airline-gold" : "text-white/85"}`}><History className="h-4 w-4" /></button>
              <button type="button" aria-label={t("chatbot.minimize")} onClick={close} className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><Minus className="h-5 w-5" /></button>
              <button type="button" aria-label={t("chatbot.close")} onClick={close} className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X className="h-5 w-5" /></button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite" aria-relevant="additions text">
              {historyOpen ? (
                <section className="mx-auto max-w-[400px]" aria-labelledby="chat-history-heading">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-airline-forest">VEYRA</p><h3 id="chat-history-heading" className="mt-1 font-serif text-2xl text-airline-night">{t("chatbot.historyTitle")}</h3></div>
                    <button type="button" disabled={responding || changingConversation} onClick={startNewConversation} className="rounded-full border border-airline-line bg-white px-3 py-2 text-xs font-semibold text-airline-forest hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold">{t("chatbot.newConversation")}</button>
                  </div>
                  {(historyLoading || changingConversation) && <p className="rounded-xl bg-white p-4 text-sm text-airline-muted" role="status">{t("chatbot.historyLoading")}</p>}
                  {historyError && <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">{t(errorKeys[historyError] ?? "chatbot.historyError")}</p>}
                  {!historyLoading && !changingConversation && !historyError && conversations.length === 0 && <p className="rounded-2xl border border-dashed border-airline-line bg-white p-5 text-sm leading-6 text-airline-muted">{t("chatbot.historyEmpty")}</p>}
                  <div className="space-y-2">
                    {conversations.map((conversation) => <div key={conversation.id} className="flex items-center gap-1 rounded-2xl border border-airline-line bg-white p-2 shadow-sm">
                      <button type="button" disabled={changingConversation} onClick={() => void openConversation(conversation.id)} className="min-w-0 flex-1 rounded-xl px-3 py-2 text-left hover:bg-airline-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold">
                        <span className="block truncate text-sm font-semibold text-airline-ink">{conversation.title}</span>
                        <time className="mt-1 block text-[11px] text-airline-muted" dateTime={conversation.updatedAt}>{new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(conversation.updatedAt))}</time>
                      </button>
                      <button type="button" aria-label={t("chatbot.deleteConversation", { title: conversation.title })} disabled={changingConversation} onClick={() => void deleteConversation(conversation.id)} className="rounded-xl p-2.5 text-airline-muted transition hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </div>)}
                  </div>
                </section>
              ) : messages.length === 0 ? (
                <div className="mx-auto max-w-[390px]">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-airline-gold/70 bg-airline-forest shadow-[0_10px_24px_rgba(24,61,55,.16)]">
                      <Image src="/images/veyra-assistant-avatar.webp" alt="" width={64} height={64} unoptimized className={`${styles.avatarPortrait} h-full w-full object-cover`} />
                    </div>
                    <h3 className="font-serif text-[26px] leading-tight text-airline-night">{t("chatbot.greeting")}</h3>
                    <p className="mt-2 text-sm leading-6 text-airline-muted">{t("chatbot.welcome")}</p>
                  </div>

                  <div className="mb-5 rounded-[22px] border border-airline-line/80 bg-white p-3 shadow-[0_10px_28px_rgba(34,30,27,.06)]">
                    <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[.14em] text-airline-muted">{t("chatbot.quickTopics")}</p>
                    {topicKeys.map((key, index) => {
                      const Icon = topicIcons[index];
                      return <button key={key} type="button" onClick={() => handleTopic(key)} className="group flex w-full items-center gap-3 border-t border-airline-line/60 px-2 py-3 text-left transition hover:bg-airline-canvas/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-airline-forest-soft text-airline-forest transition group-hover:bg-airline-forest group-hover:text-white"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                        <span className="flex-1 text-sm font-medium text-airline-ink">{t(`chatbot.${key}`)}</span>
                        <ArrowUp className="h-4 w-4 rotate-45 text-airline-muted/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-airline-forest" aria-hidden="true" />
                      </button>;
                    })}
                  </div>

                  <p className="mb-2 px-1 text-xs font-medium text-airline-muted">{t("chatbot.suggestionTitle")}</p>
                  <div className="flex flex-wrap gap-2">
                    {promptKeys.map((key, index) => {
                      const Icon = promptIcons[index];
                      return <SuggestionChip key={key} prompt={t(`chatbot.suggestions.${index}`)} icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => {
                        if (!user) { requestSignIn(); return; }
                        submitPromptRef.current(t(`chatbot.suggestions.${index}`));
                      }} />;
                    })}
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-[400px] flex-col gap-4">
                  {messages.map((message) => <div key={message.id} className={`${styles.messageEnter} flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && <span className="mr-2 mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full border border-airline-gold/60 bg-airline-forest" aria-hidden="true"><Image src="/images/veyra-assistant-avatar.webp" alt="" width={28} height={28} unoptimized className={`${styles.avatarPortrait} ${responding ? styles.avatarThinking : ""} h-full w-full object-cover`} /></span>}
                    <div className={`flex min-w-0 flex-col gap-2 ${message.role === "user" ? "max-w-[84%]" : "flex-1"}`}>
                      <div className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-airline-forest text-white" : "rounded-bl-md border border-airline-line bg-white text-airline-ink shadow-sm"}`}>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.12em] opacity-65">{message.role === "user" ? t("chatbot.you") : t("chatbot.assistant")}</p>
                        <p className="whitespace-pre-wrap">{message.content}{message.role === "assistant" && message.content === "" && <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded bg-airline-forest" aria-hidden="true" />}</p>
                        {message.role === "assistant" && message.content === "" && <span className="sr-only" role="status">{t("chatbot.sending")}</span>}
                        {message.sources && message.sources.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 border-t border-airline-line pt-2">
                          {message.sources.map((source, index) => <Link key={`${source.documentId}-${source.section}-${index}`} href={source.href} className="inline-flex max-w-full items-center gap-1 rounded-full bg-airline-forest-soft px-2.5 py-1 text-[10px] font-medium text-airline-forest hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"><span className="shrink-0">[{source.citationNumber ?? index + 1}]</span><span className="truncate">{source.title}{source.section ? ` · ${source.section}` : ""}</span></Link>)}
                        </div>}
                      </div>
                      {message.action && <ChatActionCards action={message.action} isAuthenticated={Boolean(user)} onSignIn={requestSignIn} />}
                    </div>
                  </div>)}
                  <div ref={endRef} />
                </div>
              )}
              {requestError && <p role="alert" className="mx-auto mt-4 max-w-[400px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{t(errorKeys[requestError] ?? "chatbot.error")}</p>}
            </div>

            {!user && !authLoading && (
              <div className="mx-4 mb-3 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-airline-gold/40 bg-white px-4 py-3 shadow-sm sm:mx-5">
                <div className="min-w-0"><p className="text-sm font-semibold text-airline-night">{t("chatbot.signInTitle")}</p><p className="mt-0.5 text-xs leading-5 text-airline-muted">{t("chatbot.signInDescription")}</p></div>
                <button type="button" onClick={requestSignIn} className="shrink-0 rounded-xl bg-airline-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold">{t("chatbot.signInAction")}</button>
              </div>
            )}

            <Formik initialValues={{ message: "" }} onSubmit={submitMessage}>
              <ChatComposer disabled={!user || authLoading || historyOpen || responding || changingConversation} registerSubmitPrompt={registerSubmitPrompt} />
            </Formik>
            <p className="shrink-0 px-5 pb-3 pt-2 text-center text-[10px] leading-4 text-airline-muted sm:px-7">{t("chatbot.privacyNote")}</p>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

function ChatComposer({ disabled, registerSubmitPrompt }: { disabled: boolean; registerSubmitPrompt: (submit: (prompt: string) => void) => void }) {
  const { t } = useTranslation();
  const { isSubmitting, submitForm, setFieldValue, values } = useFormikContext<{ message: string }>();
  const busy = isSubmitting;
  useEffect(() => {
    const submitPrompt = (prompt: string) => { void setFieldValue("message", prompt).then(() => submitForm()); };
    registerSubmitPrompt(submitPrompt);
    return () => registerSubmitPrompt(() => undefined);
  }, [registerSubmitPrompt, setFieldValue, submitForm]);

  return (
    <Form className="mx-4 mt-auto flex shrink-0 items-end gap-2 rounded-[20px] border border-airline-line bg-white p-2 shadow-[0_8px_28px_rgba(34,30,27,.08)] sm:mx-5">
        <Field as="textarea" name="message" rows={1} maxLength={2000} disabled={disabled || busy} placeholder={t("chatbot.placeholder")} aria-label={t("chatbot.placeholder")} className="max-h-32 min-h-[46px] flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-5 text-airline-ink outline-none placeholder:text-airline-muted/75 disabled:cursor-not-allowed disabled:opacity-70" onKeyDown={(event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submitForm();
          }
        }} />
        <button type="submit" disabled={disabled || busy || !values.message.trim()} aria-label={t("chatbot.send")} className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-airline-forest text-white transition hover:bg-airline-night disabled:cursor-not-allowed disabled:bg-airline-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold">
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> : <ArrowUp className="h-5 w-5" aria-hidden="true" />}
        </button>
    </Form>
  );
}

function SuggestionChip({ prompt, icon, onClick }: { prompt: string; icon: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-airline-line bg-white px-3 py-2 text-xs text-airline-ink transition hover:border-airline-gold hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold">{icon}{prompt}</button>;
}
