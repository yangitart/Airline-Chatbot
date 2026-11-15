"use client";

import type { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { AssistantMessage } from "../types/AssistantMessage";
import { ChatProcessingStatus } from "./ChatProcessingStatus";
import { ChatActionCards } from "./TripActionCards";

export function AssistantMessages({
  messages,
  activeReplyId,
  isAuthenticated,
  requestSignIn,
  endRef,
}: {
  messages: AssistantMessage[];
  activeReplyId?: string;
  isAuthenticated: boolean;
  requestSignIn: () => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isActiveReply = !isUser && message.id === activeReplyId;
        const isThinking = isActiveReply && !message.content.trim();
        const bubbleStyle = isUser
          ? "rounded-br-md bg-airline-forest text-white"
          : isThinking
            ? "w-fit rounded-bl-md border border-airline-forest/15 bg-airline-forest-soft"
            : "rounded-bl-md border border-airline-line bg-white text-airline-ink shadow-sm";

        return (
          <div
            key={message.id}
            className={`flex motion-safe:animate-assistant-message-in ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <span
                className={`mr-2 mt-1 size-7 shrink-0 overflow-hidden rounded-full border border-airline-gold/60 bg-airline-forest ${isActiveReply ? "ring-2 ring-airline-forest-soft" : ""}`}
                aria-hidden="true"
              >
                <Image
                  src="/images/veyra-assistant-avatar.webp"
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className={`h-full w-full object-cover ${isActiveReply ? "motion-safe:animate-assistant-avatar-thinking" : ""}`}
                />
              </span>
            )}
            <div
              className={`flex min-w-0 flex-col gap-2 ${isUser ? "max-w-[84%]" : "flex-1"}`}
            >
              <div
                className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${bubbleStyle}`}
              >
                {isThinking ? (
                  <ChatProcessingStatus label={t("chatbot.sending")} />
                ) : (
                  <>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.12em] opacity-65">
                      {t(isUser ? "chatbot.you" : "chatbot.assistant")}
                    </p>
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                      {isActiveReply && (
                        <span
                          className="ml-1 inline-block h-3.5 w-0.5 rounded-full bg-airline-forest/55 align-middle motion-safe:animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-airline-line pt-2">
                        {message.sources.map((source, index) => (
                          <Link
                            key={`${source.documentId}-${source.section}-${index}`}
                            href={source.href}
                            className="inline-flex max-w-full items-center gap-1 rounded-full bg-airline-forest-soft px-2.5 py-1 text-[10px] font-medium text-airline-forest hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"
                          >
                            <span className="shrink-0">
                              [{source.citationNumber ?? index + 1}]
                            </span>
                            <span className="truncate">
                              {source.title}
                              {source.section ? ` · ${source.section}` : ""}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {message.action && (
                <ChatActionCards
                  action={message.action}
                  isAuthenticated={isAuthenticated}
                  onSignIn={requestSignIn}
                />
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
