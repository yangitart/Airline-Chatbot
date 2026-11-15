"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Formik } from "formik";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { useTravelShell } from "@/src/components/layout/TravelShellContext";
import { supportedLanguages } from "@/src/core/locales/supportedLanguages";
import { useAssistantConversation } from "../hooks/useAssistantConversation";
import { useAssistantGreeting } from "../hooks/useAssistantGreeting";
import { chatErrorKeys } from "../utils/chatErrors";
import { AssistantPanelHeader } from "./AssistantPanelHeader";
import { AssistantHistory } from "./AssistantHistory";
import { AssistantWelcome } from "./AssistantWelcome";
import { AssistantMessages } from "./AssistantMessages";
import { ChatComposer } from "./ChatComposer";

export function TravelAssistantWidget() {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const selectedLanguage =
    supportedLanguages.find(
      (language) => language.code === i18n.resolvedLanguage,
    ) ?? supportedLanguages[0];
  const { user, authLoading, openSignIn } = useTravelShell();
  const [open, setOpen] = useState(false);
  const { assistantGreetingPhase, dismissGreeting } =
    useAssistantGreeting(pathname);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const submitPromptRef = useRef<(prompt: string) => void>(() => undefined);
  const onAccountChange = useCallback(() => setOpen(false), []);
  const requestSignIn = useCallback(() => {
    dismissGreeting();
    launcherRef.current?.focus({ preventScroll: true });
    setOpen(false);
    openSignIn();
  }, [dismissGreeting, openSignIn]);
  const {
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
  } = useAssistantConversation({
    user,
    open,
    language: selectedLanguage.code,
    requestSignIn,
    onAccountChange,
  });
  const activeReplyId = responding
    ? messages[messages.length - 1]?.id
    : undefined;
  const assistantGreeting =
    assistantGreetingPhase === "visible" && !open
      ? t("chatbot.assistantGreeting", {
          lngs: [selectedLanguage.code],
          defaultValue: t("chatbot.welcome"),
        })
      : "";
  const showAssistantGreetingBubble =
    assistantGreetingPhase !== "hidden" && !open;

  const close = useCallback(() => {
    dismissGreeting();
    setOpen(false);
    setPendingDeleteId(null);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }, [dismissGreeting, setPendingDeleteId]);
  const registerSubmitPrompt = useCallback(
    (submit: (prompt: string) => void) => {
      submitPromptRef.current = submit;
    },
    [],
  );
  const submitPrompt = (prompt: string) => {
    if (!user) {
      requestSignIn();
      return;
    }
    submitPromptRef.current(prompt);
  };
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href]",
        );
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
    window.requestAnimationFrame(() =>
      panelRef.current
        ?.querySelector<HTMLElement>(
          "button:not([disabled]), textarea:not([disabled])",
        )
        ?.focus(),
    );
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
    };
  }, [close, open]);

  useEffect(() => {
    if (open && !historyOpen)
      endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [historyOpen, messages, open]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-label={assistantGreeting || t("chatbot.launcher")}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={authLoading}
        onClick={() => {
          dismissGreeting();
          if (!user) {
            requestSignIn();
            return;
          }
          setOpen(true);
        }}
        className="group fixed bottom-[calc(1.25rem_+_env(safe-area-inset-bottom))] right-[calc(1.25rem_+_env(safe-area-inset-right))] z-[60] flex max-w-[calc(100%_-_3rem_-_env(safe-area-inset-right)_-_env(safe-area-inset-left))] items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-airline-gold disabled:cursor-wait disabled:opacity-60 sm:bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] sm:right-[calc(1.5rem_+_env(safe-area-inset-right))]"
      >
        {showAssistantGreetingBubble && (
          <span
            aria-hidden="true"
            className={[
              "absolute bottom-2 right-[calc(100%_+_0.625rem)] w-max max-w-[8.5rem] rounded-xl rounded-br-sm border border-airline-line bg-airline-paper px-3 py-2 text-left text-xs font-medium leading-snug text-airline-forest shadow-[0_5px_18px_rgb(24_61_55_/_12%)]",
              assistantGreetingPhase === "visible"
                ? "motion-safe:animate-assistant-greeting-in"
                : "motion-safe:animate-assistant-greeting-out",
            ].join(" ")}
          >
            {assistantGreeting ||
              t("chatbot.assistantGreeting", {
                lngs: [selectedLanguage.code],
                defaultValue: t("chatbot.welcome"),
              })}
          </span>
        )}
        <span
          className="relative grid size-14 shrink-0 place-items-center rounded-full border border-white/70 bg-airline-forest shadow-[0_10px_28px_rgb(24_61_55_/_28%)] transition-transform motion-safe:group-hover:-translate-y-1"
          aria-hidden="true"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <Image
              src="/images/veyra-assistant-avatar.webp"
              alt=""
              width={56}
              height={56}
              priority={pathname === "/"}
              unoptimized
              className={`h-full w-full origin-[center_54%] object-cover ${responding ? "motion-safe:animate-assistant-avatar-thinking" : "motion-safe:animate-assistant-avatar-idle"}`}
            />
          </span>
          <MessageCircle className="absolute bottom-0.5 right-0.5 size-4 rounded-full bg-airline-paper p-0.5 text-airline-forest" />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-end justify-end sm:p-4 lg:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <button
              type="button"
              aria-label={t("chatbot.close")}
              onClick={close}
              className="absolute inset-0 cursor-default bg-[rgb(19_25_25_/_34%)] backdrop-blur-[3px] motion-safe:animate-assistant-overlay-in"
            />
            <section
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="veyra-chat-title"
              className="relative z-[1] flex h-[100dvh] w-full flex-col overflow-hidden bg-airline-canvas text-airline-ink shadow-[0_28px_90px_rgb(19_25_25_/_28%)] motion-safe:max-sm:animate-assistant-panel-mobile-in sm:h-[min(820px,calc(100dvh-32px))] sm:max-w-[480px] sm:rounded-[28px] motion-safe:sm:animate-assistant-panel-in lg:max-h-[calc(100dvh-48px)]"
            >
              <AssistantPanelHeader
                responding={responding}
                changingConversation={changingConversation}
                historyOpen={historyOpen}
                startNewConversation={startNewConversation}
                onToggleHistory={() =>
                  user ? setHistoryOpen((value) => !value) : requestSignIn()
                }
                close={close}
              />

              <div
                className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {historyOpen ? (
                  <AssistantHistory
                    conversations={conversations}
                    pendingDeleteId={pendingDeleteId}
                    historyLoading={historyLoading}
                    historyError={historyError}
                    changingConversation={changingConversation}
                    responding={responding}
                    startNewConversation={startNewConversation}
                    openConversation={openConversation}
                    deleteConversation={deleteConversation}
                    setPendingDeleteId={setPendingDeleteId}
                  />
                ) : messages.length === 0 ? (
                  <AssistantWelcome onPrompt={submitPrompt} />
                ) : (
                  <AssistantMessages
                    messages={messages}
                    activeReplyId={activeReplyId}
                    isAuthenticated={Boolean(user)}
                    requestSignIn={requestSignIn}
                    endRef={endRef}
                  />
                )}
                {requestError && (
                  <p
                    role="alert"
                    className="mx-auto mt-4 max-w-[400px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    {t(chatErrorKeys[requestError] ?? "chatbot.error")}
                  </p>
                )}
              </div>

              <Formik initialValues={{ message: "" }} onSubmit={submitMessage}>
                <ChatComposer
                  disabled={
                    !user ||
                    authLoading ||
                    historyOpen ||
                    responding ||
                    changingConversation
                  }
                  registerSubmitPrompt={registerSubmitPrompt}
                />
              </Formik>
              <p className="shrink-0 px-5 pb-3 pt-2 text-center text-[10px] leading-4 text-airline-muted sm:px-7">
                {t("chatbot.privacyNote")}
              </p>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
