"use client";

import Image from "next/image";
import {
  ArrowUp,
  BriefcaseBusiness,
  Luggage,
  Plane,
  RotateCcw,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SuggestionChip } from "./SuggestionChip";

const promptKeys = ["prepare", "flightStatus", "findFlight"] as const;
const promptIcons = [Sparkles, Plane, TicketCheck] as const;
const topicKeys = [
  "newBooking",
  "manageBooking",
  "checkIn",
  "baggage",
  "flightStatus",
] as const;
const topicIcons = [
  Plane,
  BriefcaseBusiness,
  TicketCheck,
  Luggage,
  RotateCcw,
] as const;
export function AssistantWelcome({
  onPrompt,
}: {
  onPrompt: (prompt: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[390px]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-airline-gold/70 bg-airline-forest shadow-[0_10px_24px_rgba(24,61,55,.16)]">
          <Image
            src="/images/veyra-assistant-avatar.webp"
            alt=""
            width={64}
            height={64}
            unoptimized
            className="h-full w-full origin-[center_54%] object-cover motion-safe:animate-assistant-avatar-idle"
          />
        </div>
        <h3 className="font-serif text-[26px] leading-tight text-airline-night">
          {t("chatbot.greeting")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-airline-muted">
          {t("chatbot.welcome")}
        </p>
      </div>

      <div className="mb-5 rounded-[22px] border border-airline-line/80 bg-white p-3 shadow-[0_10px_28px_rgba(34,30,27,.06)]">
        <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[.14em] text-airline-muted">
          {t("chatbot.quickTopics")}
        </p>
        {topicKeys.map((key, index) => {
          const Icon = topicIcons[index];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPrompt(t(`chatbot.topicPrompts.${key}`))}
              className="group flex w-full items-center gap-3 border-t border-airline-line/60 px-2 py-3 text-left transition hover:bg-airline-canvas/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-airline-forest-soft text-airline-forest transition group-hover:bg-airline-forest group-hover:text-white">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm font-medium text-airline-ink">
                {t(`chatbot.${key}`)}
              </span>
              <ArrowUp
                className="h-4 w-4 rotate-45 text-airline-muted/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-airline-forest"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <p className="mb-2 px-1 text-xs font-medium text-airline-muted">
        {t("chatbot.suggestionTitle")}
      </p>
      <div className="flex flex-wrap gap-2">
        {promptKeys.map((key, index) => {
          const Icon = promptIcons[index];
          return (
            <SuggestionChip
              key={key}
              prompt={t(`chatbot.suggestions.${index}`)}
              icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => onPrompt(t(`chatbot.suggestions.${index}`))}
            />
          );
        })}
      </div>
    </div>
  );
}
