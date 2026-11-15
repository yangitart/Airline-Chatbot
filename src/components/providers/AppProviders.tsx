"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import "@/src/globals.css";
import { Toaster } from "react-hot-toast";
import translateSystem from "@/src/core/locales/i18next";
import { isSupportedLanguage } from "@/src/core/locales/supportedLanguages";

function LanguageSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("airline-language");
    if (
      isSupportedLanguage(savedLanguage) &&
      savedLanguage !== i18n.resolvedLanguage
    ) {
      void i18n.changeLanguage(savedLanguage);
    }
    document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language;
    document.documentElement.dir = "ltr";
  }, [i18n, i18n.language, i18n.resolvedLanguage]);
  return null;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={translateSystem}>
      <div className="app-shell">
        <LanguageSync />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4200,
            className:
              "!max-w-[min(92vw,420px)] !rounded-2xl !border !border-[#dce9e1] !bg-[#fffefa] !px-4 !py-3 !text-sm !font-medium !text-[#193b35] !shadow-[0_18px_50px_rgba(22,49,42,0.16)]",
            success: {
              iconTheme: { primary: "#247766", secondary: "#fffefa" },
            },
            error: {
              iconTheme: { primary: "#b5473a", secondary: "#fffefa" },
            },
            loading: {
              iconTheme: { primary: "#c18a36", secondary: "#fffefa" },
            },
          }}
        />
        {children}
      </div>
    </I18nextProvider>
  );
}
