"use client";

import { Check, LoaderCircle, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ChatConversationSummary } from "../../domain/models/ChatHistory";
import type { ChatErrorCode } from "../../domain/models/ChatError";
import { chatErrorKeys } from "../utils/chatErrors";
import { ChatProcessingStatus } from "./ChatProcessingStatus";

export function AssistantHistory({
  conversations,
  pendingDeleteId,
  historyLoading,
  historyError,
  changingConversation,
  responding,
  startNewConversation,
  openConversation,
  deleteConversation,
  setPendingDeleteId,
}: {
  conversations: ChatConversationSummary[];
  pendingDeleteId: string | null;
  historyLoading: boolean;
  historyError: ChatErrorCode | null;
  changingConversation: boolean;
  responding: boolean;
  startNewConversation: () => void;
  openConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setPendingDeleteId: (id: string | null) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <section
      className="mx-auto max-w-[400px]"
      aria-labelledby="chat-history-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-airline-forest">
            VEYRA
          </p>
          <h3
            id="chat-history-heading"
            className="mt-1 font-serif text-2xl text-airline-night"
          >
            {t("chatbot.historyTitle")}
          </h3>
        </div>
        <button
          type="button"
          disabled={responding || changingConversation}
          onClick={startNewConversation}
          className="rounded-full border border-airline-line bg-white px-3 py-2 text-xs font-semibold text-airline-forest hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"
        >
          {t("chatbot.newConversation")}
        </button>
      </div>
      {(historyLoading || changingConversation) && (
        <div className="mb-3 rounded-xl border border-airline-forest/15 bg-airline-forest-soft px-4 py-3">
          <ChatProcessingStatus label={t("chatbot.historyLoading")} />
        </div>
      )}
      {historyError && (
        <p
          className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          role="alert"
        >
          {t(chatErrorKeys[historyError] ?? "chatbot.historyError")}
        </p>
      )}
      {!historyLoading &&
        !changingConversation &&
        !historyError &&
        conversations.length === 0 && (
          <p className="rounded-2xl border border-dashed border-airline-line bg-white p-5 text-sm leading-6 text-airline-muted">
            {t("chatbot.historyEmpty")}
          </p>
        )}
      <div className="space-y-2">
        {conversations.map((conversation) => {
          const confirmingDelete = pendingDeleteId === conversation.id;
          const formattedDate = new Intl.DateTimeFormat(
            i18n.resolvedLanguage ?? "en",
            {
              dateStyle: "medium",
              timeStyle: "short",
            },
          ).format(new Date(conversation.updatedAt));

          return (
            <div
              key={conversation.id}
              className="flex items-center gap-1 rounded-2xl border border-airline-line bg-white p-2 shadow-sm"
            >
              {confirmingDelete ? (
                <>
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
                    <Trash2
                      className="size-4 shrink-0 text-airline-garnet"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-airline-garnet">
                        {t("chatbot.confirmDelete")}
                      </p>
                      <p className="truncate text-[11px] text-airline-muted">
                        {conversation.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={t("chatbot.confirmDeleteConversation", {
                      title: conversation.title,
                    })}
                    disabled={changingConversation}
                    onClick={() => void deleteConversation(conversation.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-airline-garnet px-2.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-900 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet"
                  >
                    {changingConversation ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check className="size-4" aria-hidden="true" />
                    )}
                    <span>{t("chatbot.confirmDeleteAction")}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={t("chatbot.cancelDelete")}
                    disabled={changingConversation}
                    onClick={() => setPendingDeleteId(null)}
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-airline-muted transition-colors hover:bg-airline-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest disabled:opacity-50"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={changingConversation}
                    onClick={() => {
                      setPendingDeleteId(null);
                      void openConversation(conversation.id);
                    }}
                    className="min-w-0 flex-1 rounded-xl px-3 py-2 text-left hover:bg-airline-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold disabled:opacity-60"
                  >
                    <span className="block truncate text-sm font-semibold text-airline-ink">
                      {conversation.title}
                    </span>
                    <time
                      className="mt-1 block text-[11px] text-airline-muted"
                      dateTime={conversation.updatedAt}
                    >
                      {formattedDate}
                    </time>
                  </button>
                  <button
                    type="button"
                    aria-label={t("chatbot.deleteConversation", {
                      title: conversation.title,
                    })}
                    disabled={changingConversation}
                    onClick={() => setPendingDeleteId(conversation.id)}
                    className="rounded-xl p-2.5 text-airline-muted transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold disabled:opacity-50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
