"use client";

import Image from "next/image";
import { History, Minus, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AssistantPanelHeader({
  responding,
  changingConversation,
  historyOpen,
  startNewConversation,
  onToggleHistory,
  close,
}: {
  responding: boolean;
  changingConversation: boolean;
  historyOpen: boolean;
  startNewConversation: () => void;
  onToggleHistory: () => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  return (
    <header className="relative isolate flex shrink-0 items-center gap-3 overflow-hidden bg-airline-forest bg-[radial-gradient(ellipse_at_80%_0%,rgb(196_164_102_/_18%),transparent_43%),linear-gradient(122deg,#173832_0%,#183d37_54%,#1e3537_100%)] px-5 pb-5 pt-5 text-white sm:px-6 sm:pb-6">
      <svg
        className="pointer-events-none absolute -top-[34px] right-[54px] -z-[1] h-[150px] w-[220px] opacity-[.58]"
        viewBox="0 0 220 150"
        fill="none"
        aria-hidden="true"
      >
        <g className="stroke-airline-paper" strokeOpacity={0.16}>
          <circle cx="164" cy="74" r="55" />
          <circle cx="164" cy="74" r="43" />
        </g>
        <path
          className="stroke-airline-gold"
          d="M18 112 C64 102 69 44 111 54 S157 120 205 28"
          strokeWidth={1.25}
          strokeDasharray="2 5"
          strokeLinecap="round"
        />
        <g className="fill-airline-gold">
          <circle cx="18" cy="112" r="2.5" />
          <circle cx="111" cy="54" r="2.5" />
          <circle cx="205" cy="28" r="2.5" />
        </g>
      </svg>
      <span
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[17px] border border-airline-gold/70 bg-airline-forest shadow-[0_4px_14px_rgb(0_0_0_/_16%)]"
        aria-hidden="true"
      >
        <Image
          src="/icon.svg"
          alt=""
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </span>
      <div className="min-w-0 flex-1">
        <h2
          id="veyra-chat-title"
          className="truncate text-lg font-semibold tracking-tight"
        >
          {t("chatbot.title")}
        </h2>
        <p className="mt-0.5 text-xs text-white/75">{t("chatbot.subtitle")}</p>
      </div>
      <button
        type="button"
        aria-label={t("chatbot.clearChat")}
        title={t("chatbot.clearChat")}
        disabled={responding || changingConversation}
        onClick={startNewConversation}
        className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={t("chatbot.historyTitle")}
        title={t("chatbot.historyTitle")}
        disabled={responding || changingConversation}
        onClick={onToggleHistory}
        className={`rounded-full p-2 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${historyOpen ? "bg-white/15 text-airline-gold" : "text-white/85"}`}
      >
        <History className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={t("chatbot.minimize")}
        onClick={close}
        className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={t("chatbot.close")}
        onClick={close}
        className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <X className="h-5 w-5" />
      </button>
    </header>
  );
}
