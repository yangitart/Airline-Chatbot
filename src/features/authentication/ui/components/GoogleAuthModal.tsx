"use client";

import { useCallback, useEffect, useState } from "react";
import { isLeft } from "fp-ts/Either";
import { useTranslation } from "react-i18next";
import { IUseCase } from "@/src/core/interfaces/IUseCase";
import { injector } from "@/src/ioc/utils/injector";
import { GoogleAuthenticationSymbols } from "../../ioc/GoogleAuthenticationSymbols";
import { BaseButton } from "@/src/components/buttons/BaseButton";

type SignInUseCase = IUseCase<void, Promise<import("fp-ts/Either").Either<string, string>>>;

export function GoogleAuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const startGoogleSignIn = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const signIn = injector<SignInUseCase>(GoogleAuthenticationSymbols.signInUseCase);
      const result = await signIn.execute();
      if (isLeft(result)) throw new Error(result.left);
      window.location.assign(result.right);
    } catch {
      setError(t("flightSearch.errors.signInFailed"));
      setBusy(false);
    }
  }, [t]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[rgb(14_20_28_/_55%)] p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative w-[min(100%,440px)] rounded-[18px] border border-[#e8e0d3] bg-white px-9 pb-7 pt-[38px] text-center shadow-[0_22px_80px_rgb(0_0_0_/_24%)] max-[650px]:px-[22px] max-[650px]:pb-6 max-[650px]:pt-[34px]" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="absolute right-4 top-[13px] cursor-pointer border-0 bg-transparent text-[28px] text-[#626973]" type="button" aria-label={t("flightSearch.auth.close")} onClick={onClose}>×</button>
        <span className="text-xs font-extrabold tracking-[.16em] text-[#86233d]">{t("flightSearch.auth.brand")}</span>
        <h2 className="mb-[7px] mt-3 text-[27px] text-[#252a32]" id="auth-title">{mode === "signin" ? t("flightSearch.auth.welcome") : t("flightSearch.auth.createAccount")}</h2>
        <p className="text-sm text-[#737b85]">{mode === "signin" ? t("flightSearch.auth.signInDescription") : t("flightSearch.auth.signUpDescription")}</p>
        <div className="my-6 mb-5 flex border-b border-[#e8e9eb]" aria-label="Account access">
          <button className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent p-[11px] text-sm ${mode === "signin" ? "border-[#86233d] font-bold text-[#86233d]" : "border-transparent text-[#737b85]"}`} type="button" onClick={() => setMode("signin")}>{t("flightSearch.nav.signIn")}</button>
          <button className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent p-[11px] text-sm ${mode === "signup" ? "border-[#86233d] font-bold text-[#86233d]" : "border-transparent text-[#737b85]"}`} type="button" onClick={() => setMode("signup")}>{t("flightSearch.auth.signUp")}</button>
        </div>
        <BaseButton className="min-h-12 w-[min(100%,340px)] gap-3 rounded-lg border border-[#d7dce2] bg-white text-sm font-semibold text-[#243246] transition hover:bg-slate-50 hover:shadow-[0_3px_10px_rgb(20_35_50_/_9%)]" variant="secondary" type="button" disabled={busy} onClick={startGoogleSignIn} leadingIcon={<span className="grid h-[22px] w-[22px] place-items-center rounded-full border border-[#d8dce0] font-extrabold text-[#4285f4]" aria-hidden="true">G</span>}>
          {busy ? t("flightSearch.auth.connecting") : t("flightSearch.auth.continueGoogle")}
        </BaseButton>
        {error && <p className="text-xs text-[#b42318]" role="alert">{error}</p>}
        <p className="mt-[22px] text-[11px] leading-5">{t("flightSearch.auth.terms")}</p>
      </section>
    </div>
  );
}
