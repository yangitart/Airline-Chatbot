"use client";

import { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Field, Form, useFormikContext } from "formik";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ChatComposer({
  disabled,
  registerSubmitPrompt,
}: {
  disabled: boolean;
  registerSubmitPrompt: (submit: (prompt: string) => void) => void;
}) {
  const { t } = useTranslation();
  const { isSubmitting, submitForm, setFieldValue, values } = useFormikContext<{
    message: string;
  }>();
  const busy = isSubmitting;
  useEffect(() => {
    const submitPrompt = (prompt: string) => {
      void setFieldValue("message", prompt).then(() => submitForm());
    };
    registerSubmitPrompt(submitPrompt);
    return () => registerSubmitPrompt(() => undefined);
  }, [registerSubmitPrompt, setFieldValue, submitForm]);

  return (
    <Form className="mx-4 mt-auto flex shrink-0 items-end gap-2 rounded-[20px] border border-airline-line bg-white p-2 shadow-[0_8px_28px_rgba(34,30,27,.08)] sm:mx-5">
      <Field
        as="textarea"
        name="message"
        rows={1}
        maxLength={2000}
        disabled={disabled || busy}
        placeholder={t("chatbot.placeholder")}
        aria-label={t("chatbot.placeholder")}
        className="max-h-32 min-h-[46px] flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-5 text-airline-ink outline-none placeholder:text-airline-muted/75 disabled:cursor-not-allowed disabled:opacity-70"
        onKeyDown={(event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submitForm();
          }
        }}
      />
      <button
        type="submit"
        disabled={disabled || busy || !values.message.trim()}
        aria-label={t(busy ? "chatbot.sending" : "chatbot.send")}
        className={`mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-airline-forest text-white transition-colors enabled:hover:bg-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold ${busy ? "cursor-wait" : "disabled:cursor-not-allowed disabled:bg-airline-muted/30"}`}
      >
        {busy ? (
          <LoaderCircle
            className="size-5 motion-safe:animate-spin"
            aria-hidden="true"
          />
        ) : (
          <ArrowUp className="size-5" aria-hidden="true" />
        )}
      </button>
    </Form>
  );
}
