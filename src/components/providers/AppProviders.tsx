"use client";

import { ReactNode } from "react";
import { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import "@/src/globals.css";
import { Toaster } from "react-hot-toast";
import translateSystem from "@/src/core/locales/i18next";

function LanguageSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("airline-language");
    if ((savedLanguage === "en" || savedLanguage === "es") && savedLanguage !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }
    document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language;
  }, [i18n.language, i18n.resolvedLanguage]);
  return null;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={translateSystem}>
      <div className="app-shell">
        <LanguageSync />
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </div>
    </I18nextProvider>
  );
}
