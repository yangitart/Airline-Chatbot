"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { injector } from "@/src/ioc/utils/injector";
import { GoogleAuthenticationSymbols } from "../../ioc/GoogleAuthenticationSymbols";
import { BaseButton } from "@/src/components/buttons/BaseButton";

type SignInUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, string>>>;

export function GoogleAuthModal({ onClose, onRedirect }: { onClose: () => void; onRedirect: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const dialogRef = useRef<HTMLElement>(null);

  const startGoogleSignIn = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const signIn = injector<SignInUseCase>(GoogleAuthenticationSymbols.signInUseCase);
      const result = await signIn.execute();
      if (isLeft(result)) throw new Error(result.left);
      onRedirect();
      window.location.assign(result.right);
    } catch {
      setError(t("flightSearch.errors.signInFailed"));
      setBusy(false);
    }
  }, [onRedirect, t]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] grid animate-soft-rise place-items-center bg-airline-night/70 p-5 backdrop-blur-md motion-reduce:animate-none" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="relative w-[min(100%,440px)] animate-soft-rise overflow-hidden rounded-[28px] border border-white/80 bg-airline-paper px-9 pb-8 pt-10 text-center text-airline-ink shadow-[0_30px_90px_rgb(10_35_30_/_30%)] motion-reduce:animate-none max-[650px]:px-6" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div aria-hidden="true" className="absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-airline-gold via-airline-garnet to-airline-forest" />
        <span aria-hidden="true" className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-airline-gold/10 blur-2xl animate-soft-glow motion-reduce:animate-none" />
        <button className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#f0eee7] text-xl text-airline-muted transition-all duration-300 hover:rotate-90 hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-garnet motion-reduce:transform-none" type="button" aria-label={t("flightSearch.auth.close")} onClick={onClose}>×</button>
        <span className="relative text-[10px] font-bold uppercase tracking-[.2em] text-airline-garnet">{t("flightSearch.auth.brand")}</span>
        <h2 className="relative mb-2 mt-3 text-[28px] font-semibold tracking-tight text-airline-forest" id="auth-title">{mode === "signin" ? t("flightSearch.auth.welcome") : t("flightSearch.auth.createAccount")}</h2>
        <p className="relative text-sm leading-6 text-airline-muted">{mode === "signin" ? t("flightSearch.auth.signInDescription") : t("flightSearch.auth.signUpDescription")}</p>
        <div className="relative my-6 flex rounded-full bg-airline-forest-soft/70 p-1" aria-label={t("flightSearch.auth.accountAccess")}>
          <button className={`flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold ${mode === "signin" ? "bg-white text-airline-forest shadow-[0_4px_12px_rgb(23_40_59_/_8%)]" : "text-airline-muted hover:text-airline-forest"}`} type="button" onClick={() => setMode("signin")}>{t("flightSearch.nav.signIn")}</button>
          <button className={`flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold ${mode === "signup" ? "bg-white text-airline-forest shadow-[0_4px_12px_rgb(23_40_59_/_8%)]" : "text-airline-muted hover:text-airline-forest"}`} type="button" onClick={() => setMode("signup")}>{t("flightSearch.auth.signUp")}</button>
        </div>
        <BaseButton className="relative min-h-12 w-[min(100%,340px)] gap-3 rounded-xl border border-airline-line bg-white text-sm font-semibold text-airline-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-airline-gold/70 hover:bg-[#fffdf7] hover:shadow-[0_10px_24px_rgb(20_35_50_/_10%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none" variant="secondary" type="button" disabled={busy} onClick={startGoogleSignIn} leadingIcon={<span className="grid h-[22px] w-[22px] place-items-center rounded-full border border-[#d8dce0] font-extrabold text-[#4285f4]" aria-hidden="true">G</span>}>
          {busy ? t("flightSearch.auth.connecting") : t("flightSearch.auth.continueGoogle")}
        </BaseButton>
        {error && <p className="animate-soft-rise text-xs text-[#b42318] motion-reduce:animate-none" role="alert">{error}</p>}
        <p className="relative mt-[22px] text-[11px] leading-5 text-airline-muted">{t("flightSearch.auth.terms")}</p>
      </section>
    </div>
  );
}
