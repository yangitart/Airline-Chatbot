"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { isLeft } from "fp-ts/Either";
import { LoaderCircle, X } from "lucide-react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next";
import { googleAuthenticationServices } from "../../ioc/googleAuthenticationServices";
type AuthMode = "signin" | "signup";

const focusStyle =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-forest";

export function GoogleAuthModal({
  onClose,
  onRedirect,
}: {
  onClose: () => void;
  onRedirect: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const signingIn = mode === "signin";

  const dismiss = () => {
    dialogRef.current?.close();
    onClose();
  };

  const startGoogleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setHasError(false);
    setMessage("");
    try {
      const result = await googleAuthenticationServices.signIn.execute();
      // The traveler may dismiss the dialog while OAuth is being prepared.
      if (!dialogRef.current?.open) return;
      if (isLeft(result)) throw new Error(result.left);
      onRedirect();
      window.location.assign(result.right);
    } catch {
      if (!dialogRef.current?.open) return;
      setHasError(true);
      setBusy(false);
    }
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setHasError(false);
    setMessage("");
    try {
      const credentials = { email: email.trim(), password };
      const result = signingIn
        ? resetMode
          ? await googleAuthenticationServices.requestPasswordReset.execute(credentials.email)
          : await googleAuthenticationServices.emailSignIn.execute(credentials)
        : await googleAuthenticationServices.emailSignUp.execute(credentials);
      if (isLeft(result)) throw new Error(result.left);
      if (resetMode) {
        setMessage(t("flightSearch.auth.resetEmailSent"));
        return;
      }
      if (signingIn || result.right) {
        onRedirect();
        window.location.assign("/?signedIn=1");
        return;
      }
      setMessage(t("flightSearch.auth.confirmEmail"));
    } catch {
      setHasError(true);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    dialog.showModal();
    root.style.overflow = "hidden";
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto overscroll-contain rounded-[28px] border border-airline-line bg-airline-paper p-0 text-airline-ink shadow-[0_24px_80px_rgb(13_29_41_/_28%)] backdrop:bg-airline-night/60 backdrop:backdrop-blur-sm motion-safe:animate-soft-rise motion-safe:[animation-duration:240ms]"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget)
          dismiss();
      }}
    >
      <header className="bg-airline-forest-soft px-6 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight text-airline-forest">
            <Image src="/icon.svg" alt="" width={32} height={32} />
            <span>{t("flightSearch.auth.brand")}</span>
          </div>
          <button
            className={`grid size-11 shrink-0 place-items-center rounded-full text-airline-forest transition-colors hover:bg-airline-forest/10 ${focusStyle}`}
            type="button"
            aria-label={t("flightSearch.auth.close")}
            onClick={dismiss}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <h2
          className="mt-4 font-serif text-[clamp(1.75rem,6vw,2.125rem)] font-semibold leading-tight tracking-tight text-airline-forest"
          id={titleId}
        >
          {t(
            resetMode
              ? "flightSearch.auth.resetTitle"
              : signingIn
                ? "flightSearch.auth.welcome"
                : "flightSearch.auth.createAccount",
          )}
        </h2>
        <p
          className="mt-2 text-sm leading-6 text-airline-forest/85"
          id={descriptionId}
        >
          {t(
            resetMode
              ? "flightSearch.auth.resetDescription"
              : signingIn
                ? "flightSearch.auth.signInDescription"
                : "flightSearch.auth.signUpDescription",
          )}
        </p>
      </header>

      <div className="space-y-4 px-6 pb-6 pt-5 sm:px-8 sm:pb-7 sm:pt-6">
        {!resetMode && (
          <div
            className="grid grid-cols-2 gap-1 rounded-xl bg-airline-canvas p-1"
            role="group"
            aria-label={t("flightSearch.auth.accountAccess")}
          >
            {(
              [
                { value: "signin", label: t("flightSearch.nav.signIn") },
                { value: "signup", label: t("flightSearch.auth.signUp") },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                className={`min-h-11 min-w-0 rounded-lg px-2 py-2 text-sm font-semibold leading-snug transition-colors disabled:opacity-60 ${focusStyle} ${mode === value ? "bg-white text-airline-forest shadow-sm" : "text-airline-forest/80 enabled:hover:text-airline-forest"}`}
                type="button"
                aria-pressed={mode === value}
                disabled={busy}
                onClick={() => {
                  setMode(value);
                  setResetMode(false);
                  setHasError(false);
                  setMessage("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <form
          className="space-y-3"
          onSubmit={(event) => void submitEmail(event)}
        >
          <label className="block space-y-1.5 text-sm font-medium text-airline-forest">
            <span>{t("flightSearch.auth.email")}</span>
            <input
              className="min-h-11 w-full rounded-xl border border-airline-line bg-white px-3 text-airline-ink outline-none focus-visible:border-airline-forest focus-visible:ring-2 focus-visible:ring-airline-forest/20"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {!resetMode && (
            <label className="block space-y-1.5 text-sm font-medium text-airline-forest">
              <span>{t("flightSearch.auth.password")}</span>
              <input
                className="min-h-11 w-full rounded-xl border border-airline-line bg-white px-3 text-airline-ink outline-none focus-visible:border-airline-forest focus-visible:ring-2 focus-visible:ring-airline-forest/20"
                type="password"
                autoComplete={signingIn ? "current-password" : "new-password"}
                minLength={signingIn ? undefined : 8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          )}
          <button
            className={`min-h-12 w-full rounded-xl bg-airline-forest px-4 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-airline-forest/90 disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
            type="submit"
            disabled={busy}
          >
            {t(
              resetMode
                ? "flightSearch.auth.sendResetLink"
                : signingIn
                  ? "flightSearch.auth.emailSignIn"
                  : "flightSearch.auth.emailSignUp",
            )}
          </button>
        </form>
        {signingIn && !resetMode && (
          <button
            className={`w-full text-sm font-medium text-airline-forest underline underline-offset-4 ${focusStyle}`}
            type="button"
            onClick={() => {
              setResetMode(true);
              setMessage("");
              setHasError(false);
            }}
          >
            {t("flightSearch.auth.forgotPassword")}
          </button>
        )}
        {resetMode && (
          <button
            className={`w-full text-sm font-medium text-airline-forest underline underline-offset-4 ${focusStyle}`}
            type="button"
            onClick={() => {
              setResetMode(false);
              setMessage("");
            }}
          >
            {t("flightSearch.auth.backToSignIn")}
          </button>
        )}
        {!resetMode && (
          <>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-airline-muted">
              {t("flightSearch.auth.or")}
            </p>

            <button
              className={`flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-airline-forest/25 bg-white px-4 py-3 text-sm font-semibold text-airline-forest shadow-sm transition-colors enabled:hover:border-airline-forest/50 enabled:hover:bg-airline-forest-soft disabled:cursor-wait disabled:bg-airline-canvas disabled:shadow-none ${focusStyle}`}
              type="button"
              aria-busy={busy}
              disabled={busy}
              onClick={() => void startGoogleSignIn()}
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-5 shrink-0 motion-safe:animate-spin"
                />
              ) : (
                <FcGoogle aria-hidden="true" className="size-5 shrink-0" />
              )}
              <span className="leading-snug">
                {t(
                  busy
                    ? "flightSearch.auth.working"
                    : "flightSearch.auth.continueGoogle",
                )}
              </span>
            </button>
          </>
        )}
        <span className="sr-only" role="status">
          {busy ? t("flightSearch.auth.working") : ""}
        </span>
        {hasError && (
          <p
            className="rounded-lg bg-airline-garnet/10 px-3 py-2.5 text-sm leading-snug text-airline-garnet"
            role="alert"
          >
            {t("flightSearch.errors.signInFailed")}
          </p>
        )}
        {message && (
          <p
            className="rounded-lg bg-airline-forest-soft px-3 py-2.5 text-sm text-airline-forest"
            role="status"
          >
            {message}
          </p>
        )}
        <p className="text-center text-xs leading-5 text-airline-muted">
          {t("flightSearch.auth.terms")}
        </p>
      </div>
    </dialog>
  );
}
