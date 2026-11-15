"use client";

import { useState, type FormEvent } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import { googleAuthenticationServices } from "../../ioc/googleAuthenticationServices";

export default function ResetPasswordView() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMatch = confirmation.length > 0 && password === confirmation;
  const passwordsMismatch = confirmation.length > 0 && password !== confirmation;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError(false);
    if (password.length < 8 || password !== confirmation) return;

    setBusy(true);
    try {
      const result = await googleAuthenticationServices.updatePassword.execute(password);
      if (isLeft(result)) throw new Error(result.left);
      window.location.assign("/?passwordUpdated=1");
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-[70dvh] w-full max-w-md place-items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-airline-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-serif text-3xl font-semibold text-airline-forest">
          {t("flightSearch.auth.resetTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-airline-muted">
          {t("flightSearch.auth.chooseNewPassword")}
        </p>
        <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)}>
          <label className="block space-y-1.5 text-sm font-medium text-airline-forest">
            <span>{t("flightSearch.auth.newPassword")}</span>
            <input
              className="min-h-11 w-full rounded-xl border border-airline-line px-3 text-airline-ink outline-none focus-visible:border-airline-forest focus-visible:ring-2 focus-visible:ring-airline-forest/20"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={passwordTooShort}
              aria-describedby="new-password-requirement"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
            />
            <span
              id="new-password-requirement"
              className={`block text-xs font-normal ${passwordTooShort ? "text-airline-garnet" : passwordsMatch ? "text-airline-forest" : "text-airline-muted"}`}
              aria-live="polite"
            >
              {t(password.length >= 8 ? "flightSearch.auth.passwordLengthValid" : "flightSearch.auth.passwordMinLength")}
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-airline-forest">
            <span>{t("flightSearch.auth.confirmPassword")}</span>
            <input
              className="min-h-11 w-full rounded-xl border border-airline-line px-3 text-airline-ink outline-none focus-visible:border-airline-forest focus-visible:ring-2 focus-visible:ring-airline-forest/20"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={passwordsMismatch}
              aria-describedby={confirmation.length ? "password-match-status" : undefined}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError(false);
              }}
            />
            {confirmation.length > 0 && (
              <span
                id="password-match-status"
                className={`block text-xs font-normal ${passwordsMatch ? "text-airline-forest" : "text-airline-garnet"}`}
                aria-live="polite"
              >
                {t(passwordsMatch ? "flightSearch.auth.passwordsMatch" : "flightSearch.auth.passwordMismatch")}
              </span>
            )}
          </label>
          <button
            className="min-h-12 w-full rounded-xl bg-airline-forest px-4 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-airline-forest/90 disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={busy}
          >
            {t("flightSearch.auth.updatePassword")}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-sm text-airline-garnet" role="alert">
            {t("flightSearch.errors.signInFailed")}
          </p>
        )}
      </section>
    </main>
  );
}
